#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <input_image>"
    exit 1
fi

INPUT_IMAGE="$1"
OUTPUT_PREFIX="${INPUT_IMAGE%.*}"

DIMENSIONS=$(magick identify -format "%wx%h" "$INPUT_IMAGE")
WIDTH=$(echo "$DIMENSIONS" | cut -d'x' -f1)
HEIGHT=$(echo "$DIMENSIONS" | cut -d'x' -f2)

LEVEL=1
while (( WIDTH > 1 || HEIGHT > 1 )); do
    NEW_WIDTH=$(( WIDTH / 2 ))
    NEW_HEIGHT=$(( HEIGHT / 2 ))
    if (( NEW_WIDTH < 1 )); then NEW_WIDTH=1; fi
    if (( NEW_HEIGHT < 1 )); then NEW_HEIGHT=1; fi

    magick "$INPUT_IMAGE" -resize "${NEW_WIDTH}x${NEW_HEIGHT}" "${OUTPUT_PREFIX}_mip${LEVEL}.png"
    printf "(mipmap: %d) (width: %d) (height: %d)\n" $LEVEL $NEW_WIDTH $NEW_HEIGHT

    WIDTH=$NEW_WIDTH
    HEIGHT=$NEW_HEIGHT
    LEVEL=$(( LEVEL + 1 ))
done
echo Done
