DEL ..\biom-map.js
DEL ..\biom-map-static-view.txt
TYPE ..\src\*.js >> ..\biom-map.js
TYPE ..\src\snip.header.html > ..\biom-map-static-view.txt
TYPE ..\biom-map.js >> ..\biom-map-static-view.txt
TYPE ..\src\snip.footer.html >> ..\biom-map-static-view.txt
