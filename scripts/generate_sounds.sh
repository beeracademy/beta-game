#!/bin/fish

cd ./public/sounds

for f in *.wav
  set filename (echo $f | sed 's/\.[^.]*$//')
  ffmpeg -n -i "$f" -acodec libvorbis "$filename.ogg"
  ffmpeg -n -i "$f" -vn -ar 44100 -ac 2 -b:a 192k "$filename.mp3"
  rm $f
end

for f in *.mp3
  set filename (echo $f | sed 's/\.[^.]*$//')
  if ! test -f "$filename.ogg"
    ffmpeg -n -i "$f" -acodec libvorbis "$filename.ogg"
  end
end

for f in *.ogg
  set filename (echo $f | sed 's/\.[^.]*$//')
  if ! test -f "$filename.mp3"
    ffmpeg -n -i "$f" -vn -ar 44100 -ac 2 -b:a 192k "$filename.mp3"
  end
end
