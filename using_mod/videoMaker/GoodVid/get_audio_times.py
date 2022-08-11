import re
import lyricsgenius
import lyricsgenius.song as song
genius = lyricsgenius.Genius('khahSx3FCADnQl_yaPnQCeGtioQplsfEqRagZcUzBhtwpHL0Dv9hOQJiCAbCho6z')

x=genius.search_song("Sacrificial",'rezz')
# x.save_lyrics("lyrics2.json")
ly=re.sub(r"(\[[\w\W]*?\])",'',x.lyrics)
with open("lyrics.txt","wt") as f:
    f.write(ly)
    # f.write(x.lyrics)