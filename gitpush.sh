#!/bin/sh
echo "Commit comment?"
read msg
git add . && git commit -m "$msg" && git push