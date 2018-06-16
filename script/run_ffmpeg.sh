#!/bin/sh
# Script to run rtp ffmpeg
local_sdp=$1
remote_audio=$2
remote_video=$3

exec=./ffmpeg

echo $local_sdp

#echo $local_sdp > file.sdp

echo $remote_host

$exec -analyzeduration 100000000 -probesize 1000000000 -protocol_whitelist "rtp,sdp,file,udp,tcp" -re  -f sdp -i file.sdp -s 640x480 -vcodec libx264 -tune zerolatency -acodec aac -y -f mp4 test.mp4 &
#$exec -re -i test_vid.mp4 -vn -acodec libopus -f rtp $remote_audio &
#$exec -re -i test_vid.mp4 -vcodec libx264 -tune zerolatency -an -f rtp $remote_video
