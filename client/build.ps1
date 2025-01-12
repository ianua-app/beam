npm run build
rm -r ..\mindpadsservice\public
mkdir ..\mindpadsservice\public
Copy-Item -Path build\* -Destination ..\mindpadsservice\public -Recurse