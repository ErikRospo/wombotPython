import json
import requests

ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"


class Rest:

    def __init__(self,
                 hostname,
                 delay=250,
                 cookies_enabled=True,
                 supports_https=False,
                 default_port=443):
        self.hostname = hostname
        self.queue = []
        self._delay = delay
        self.delay_handle = None
        self.port = default_port
        self.cookies = {}
        self.cookies_enabled = cookies_enabled
        self.custom_headers = {}
        if supports_https:
            self.hostname = "https://" + self.hostname
        else:
            self.hostname = "http://" + self.hostname

    def scheduler(self):
        if (len(self.queue) > 0):
            self.queue.pop()()
        else:
            if self.delay_handle != None:
                pass
            self.delay_handle = None

    def enter_queue(f):
        pass

    def handle_cookies(self, setters):
        if (not setters): return
        if (not self.cookies_enabled): return

        for cookie_setter in setters:
            [name, value_setter] = cookie_setter.split("=")
            [value] = value_setter.split(";")
            self.cookies[name] = value

    def get_cookies(self):
        if (not self.cookies_enabled): return ""
        return "; ".join([
            "{}={}".format(name, value)
            for name, value in self.cookies.items()
        ])

    def _merge(self, dict1: dict, dict2: dict):
        return (dict2.update(dict1))

    def post(self, path, data={}, request_headers={}, method="POST", port=-1):
        post_data = json.dumps(data)
        headers = {
            "Cookie": self.get_cookies(),
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": str(len(post_data)),
            "User-Agent": ua,
        }
        if port == -1:
            port = self.port
        self._merge(headers, request_headers)
        self._merge(headers, self.custom_headers)

        res = requests.request(stream=False,
                               method=method,
                               url=self.hostname + path + ":" + str(port),
                               headers=headers,
                               cookies=self.get_cookies(),
                               data=post_data)

        # self.handle_cookies(res.headers["set-cookie"])
        return res

    def get(self, path, request_headers={}, method="GET", port=-1):
        headers = {
            "Cookie": self.get_cookies(),
            "User-Agent": ua,
        }
        if port == -1:
            port = self.port
        self._merge(headers, request_headers)
        self._merge(headers, self.custom_headers)

        res = requests.request(stream=False,
                               method=method,
                               url=self.hostname + path + ":" + str(port),
                               headers=headers,
                               cookies=self.get_cookies())

        self.handle_cookies(res.headers["set-cookie"])
        return res.json()

    def put(self, path, data, port=-1):
        return self.post(path, data, "PUT", port=port)

    def options(self, path, request_method, port=-1):
        request_headers = {}

        if (type(request_method) == str):
            request_headers = {
                "Access-Control-Request-Method": request_method,
            }
        elif (type(request_method) == dict):
            request_headers = request_method
        else:
            request_headers = {}
        return self.get(path,
                        method="OPTIONS",
                        request_headers=request_headers,
                        port=port)


if __name__ == "__main__":
    a = Rest("paint.api.wombo.ai")
    print("options starting")
    a.options("/api/tasks", "POST")
    print("options done")
    print("post starting")
    a.post("/api/tasks",
           data=json.loads("{premium:false}"),
           request_headers={})
    print("post done")