import tracemalloc
import index as task
import styles
import argparse
tracemalloc.start()
parser = argparse.ArgumentParser(description="A simple CLI for the Wombo Art API")
parser.add_argument("--quiet", action="store_true", help="Don't print anything")
parser.add_argument("prompt", help="The prompt to use")
parser.add_argument("style", help="The style to use")
parser.add_argument("--nofinal", action="store_true", help="don't download the final image")
parser.add_argument("--inter", action="store_true", help="Download the intermediate images")
parser.add_argument("--times", type=int, help="the number of times to generate")


argc = parser.parse_args()
quiet = argc.quiet
inter=argc.inter
final=not argc.nofinal
print("quiet:",quiet)
print("inter:",inter)
print("final:",final)

def generate(prompt, style, prefix,settings={'quiet':quiet,'inter':inter,'final':final}):
    def handler(state="",id="",task="",url="",path="",inter=""):
        switch = {
            "authenticated": lambda: print(f"{prefix}Authenticated, allocating a task..."),
            "allocated": lambda: print(f"{prefix}Allocated, submitting the prompt and style..."),
            "submitted": lambda: print(f"{prefix}Submitted! Waiting on results..."),
            "progress": lambda: print(f"{prefix}Submitted! Waiting on results..."),
            "generated": lambda: print(f"{prefix}Results are in, downloading the final image..."),
            "downloaded": lambda: print(f"{prefix}Downloaded!"),
        }

        switch[state]()
    final=settings["final"]
    inter=settings["inter"]
    res =task.task(prompt, style, handler, {final, inter,None,"./generated/"})
    if final:
        print(f"{prefix}Your results have been downloaded to the following files:")
    else:
        print(f"{prefix}Task finished, the results are available at the following addresses:")
    # for inter in res.inter:
        # print(inter)
    # if final:
    #     print(res.path)
    # else:
    #     print(res.url)
    
def main():
    prompt=argc.prompt
    style=argc.style
    if (not quiet):
        s=styles.styles.get(style)
        print(f"Using prompt: {prompt}")
        print(f"Using style: {s}")
    if (argc.times):
        for n in range(argc.times):
            generate(prompt, style, f"{n+1}/{argc.times} ")
    else:
        generate(prompt, style, "")

if __name__=="__main__":
    main()