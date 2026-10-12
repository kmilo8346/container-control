# Painting Image v3

Image: `kmilo8346/painting-runner:v3`

Required environment variable: `IMAGE_URL`, a public HTTPS image delivery URL
(e.g. Cloudinary). There is no PAINTING_ID or default artwork.

The container downloads the image, renders it using Chafa as full-color Unicode
half-blocks, prints PAINTING_START, the artwork line by line, and PAINTING_END.
It stays alive until stopped. There is no container-started message.

Downloads are limited to 20 MB and 60 seconds. No public port is required.
The frontend must interpret ANSI color sequences to display the colors.

Existing painting text files are retained as source material for previous versions;
v3 does not bundle them. Adding a new image URL requires no Docker rebuild.
