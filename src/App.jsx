import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";

// Inline flag SVGs as base64 data URIs (Emoji One v1, CC BY-SA 4.0)
const FLAG_DATA = {
  "flag-for-china": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0RFMjkxMCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PGcgZmlsbD0iI0ZGREUwMCI+PHBvbHlnb24gcG9pbnRzPSIxMiw4IDEzLjgsMTMuNSAxOS42LDEzLjUgMTQuOSwxNyAxNi43LDIyLjUgMTIsMTkgNy4zLDIyLjUgOS4xLDE3IDQuNCwxMy41IDEwLjIsMTMuNSIvPjxwb2x5Z29uIHBvaW50cz0iMjQsNCAyNSw2LjIgMjcuNCw2LjIgMjUuNSw3LjYgMjYuMyw5LjggMjQsOC4yIDIxLjcsOS44IDIyLjUsNy42IDIwLjYsNi4yIDIzLDYuMiIvPjxwb2x5Z29uIHBvaW50cz0iMjgsOSAyOSwxMS4yIDMxLjQsMTEuMiAyOS41LDEyLjYgMzAuMywxNC44IDI4LDEzLjIgMjUuNywxNC44IDI2LjUsMTIuNiAyNC42LDExLjIgMjcsMTEuMiIvPjxwb2x5Z29uIHBvaW50cz0iMjgsMTYgMjksMTguMiAzMS40LDE4LjIgMjkuNSwxOS42IDMwLjMsMjEuOCAyOCwyMC4yIDI1LjcsMjEuOCAyNi41LDE5LjYgMjQuNiwxOC4yIDI3LDE4LjIiLz48cG9seWdvbiBwb2ludHM9IjI0LDIxIDI1LDIzLjIgMjcuNCwyMy4yIDI1LjUsMjQuNiAyNi4zLDI2LjggMjQsMjUuMiAyMS43LDI2LjggMjIuNSwyNC42IDIwLjYsMjMuMiAyMywyMy4yIi8+PC9nPjwvc3ZnPg==",
  "flag-for-india": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0ZGOTkzMyIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjMTM4ODA4IiB5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDgwIiBzdHJva2Utd2lkdGg9IjAuOCIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEiIGZpbGw9IiMwMDAwODAiLz48L3N2Zz4=",
  "flag-for-russia": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0id2hpdGUiIHdpZHRoPSI2NCIgaGVpZ2h0PSIxNiIvPjxyZWN0IGZpbGw9IiMwMDM5QTYiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjRDUyQjFFIiB5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PC9zdmc+",
  "flag-for-united-states": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0IyMjIzNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PGcgZmlsbD0id2hpdGUiPjxyZWN0IHk9IjMuNyIgd2lkdGg9IjY0IiBoZWlnaHQ9IjMuNyIvPjxyZWN0IHk9IjExLjEiIHdpZHRoPSI2NCIgaGVpZ2h0PSIzLjciLz48cmVjdCB5PSIxOC41IiB3aWR0aD0iNjQiIGhlaWdodD0iMy43Ii8+PHJlY3QgeT0iMjUuOCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjMuNyIvPjxyZWN0IHk9IjMzLjIiIHdpZHRoPSI2NCIgaGVpZ2h0PSIzLjciLz48cmVjdCB5PSI0MC42IiB3aWR0aD0iNjQiIGhlaWdodD0iMy43Ii8+PC9nPjxyZWN0IGZpbGw9IiMzQzNCNkUiIHdpZHRoPSIyNS42IiBoZWlnaHQ9IjI1LjgiLz48ZyBmaWxsPSJ3aGl0ZSI+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEuMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNCIgcj0iMS4yIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSI0IiByPSIxLjIiLz48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iMS4yIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSI4IiByPSIxLjIiLz48Y2lyY2xlIGN4PSI0IiBjeT0iMTIiIHI9IjEuMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEuMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTIiIHI9IjEuMiIvPjxjaXJjbGUgY3g9IjgiIGN5PSIxNiIgcj0iMS4yIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMS4yIi8+PGNpcmNsZSBjeD0iNCIgY3k9IjIwIiByPSIxLjIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjIwIiByPSIxLjIiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjIiLz48L2c+PC9zdmc+",
  "flag-for-iran": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzIzOUY0MCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjREEwMDAwIiB5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iNSIgZmlsbD0iI0RBMDAwMCIvPjwvc3ZnPg==",
  "flag-for-indonesia": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0ZGMDAwMCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjI0Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjI0IiB3aWR0aD0iNjQiIGhlaWdodD0iMjQiLz48L3N2Zz4=",
  "flag-for-pakistan": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0id2hpdGUiIHdpZHRoPSIxNiIgaGVpZ2h0PSI0OCIvPjxyZWN0IGZpbGw9IiMwMTQxMUMiIHg9IjE2IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiLz48Y2lyY2xlIGN4PSIzNiIgY3k9IjI0IiByPSI5IiBmaWxsPSIjMDE0MTFDIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjM4IiBjeT0iMjQiIHI9IjcuNSIgZmlsbD0iIzAxNDExQyIvPjxwb2x5Z29uIHBvaW50cz0iNDIsMTggNDMsMjEgNDYsMjEgNDMuNSwyMyA0NC41LDI2IDQyLDI0IDM5LjUsMjYgNDAuNSwyMyAzOCwyMSA0MSwyMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=",
  "flag-for-egypt": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0NFMTEyNiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjMTExIiB5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PHBhdGggZD0iTTI4LDIwIEwzMiwyNiBMMzYsMjAgWiIgZmlsbD0iI0MwOTMwMCIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+",
  "flag-for-qatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0id2hpdGUiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0OCIvPjxyZWN0IGZpbGw9IiM4QTE1MzgiIHg9IjIwIiB3aWR0aD0iNDQiIGhlaWdodD0iNDgiLz48cG9seWdvbiBmaWxsPSJ3aGl0ZSIgcG9pbnRzPSIyMCwwIDI4LDQuOCAyMCw5LjYgMjgsMTQuNCAyMCwxOS4yIDI4LDI0IDIwLDI4LjggMjgsMzMuNiAyMCwzOC40IDI4LDQzLjIgMjAsNDgiLz48L3N2Zz4=",
  "flag-for-saudi-arabia": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzAwNkMzNSIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PHJlY3QgeD0iMTgiIHk9IjI4IiB3aWR0aD0iMjgiIGhlaWdodD0iMS41IiByeD0iMC41IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjIyIiB5PSIxNCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjgiIHJ4PSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+",
  "flag-for-canada": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0ZGMDAwMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjQ4Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHg9IjE2IiB3aWR0aD0iMzIiIGhlaWdodD0iNDgiLz48cmVjdCBmaWxsPSIjRkYwMDAwIiB4PSI0OCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjQ4Ii8+PHBhdGggZD0iTTMyLDE0IEwzNCwyMCBMMzAsMTggTDI4LDIyIEwyNywxOCBMMjQsMjAgTDI2LDE2IEwyMiwxNiBMMjgsMTQgTDI2LDExIEwzMiwxNFogTTMyLDE0IEwzMCwyMCBMMzQsMTggTDM2LDIyIEwzNywxOCBMNDAsMjAgTDM4LDE2IEw0MiwxNiBMMzYsMTQgTDM4LDExIEwzMiwxNFoiIGZpbGw9IiNGRjAwMDAiLz48L3N2Zz4=",
  "flag-for-brazil": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzAwOUIzQSIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PHBvbHlnb24gZmlsbD0iI0ZFREYwMCIgcG9pbnRzPSIzMiw2IDU4LDI0IDMyLDQyIDYsMjQiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI0IiByPSI4IiBmaWxsPSIjMDAyNzc2Ii8+PHBhdGggZD0iTTI0LDI0IFEzMiwyMCA0MCwyNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+",
  "flag-for-argentina": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzc0QUNERiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjNzRBQ0RGIiB5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iNCIgZmlsbD0iI0Y2QjQwRSIvPjwvc3ZnPg==",
  "flag-for-turkey": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0UzMEExNyIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iOSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIyNyIgY3k9IjI0IiByPSI3LjIiIGZpbGw9IiNFMzBBMTciLz48cG9seWdvbiBwb2ludHM9IjM2LDI0IDM4LDIxIDM1LDIzIDM5LDIzIDM2LDIxIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJzY2FsZSgxLjUpIHRyYW5zbGF0ZSgtMTIsLTgpIi8+PC9zdmc+",
  "flag-for-australia": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzAwMDA4QiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PGcgZmlsbD0id2hpdGUiPjxwb2x5Z29uIHBvaW50cz0iMTAsMzQgMTEsMzcgMTQsMzcgMTEuNSwzOSAxMi41LDQyIDEwLDQwIDcuNSw0MiA4LjUsMzkgNiwzNyA5LDM3Ii8+PHBvbHlnb24gcG9pbnRzPSI0OCwxNCA0OSwxNiA1MSwxNiA0OS41LDE3LjUgNTAsMTkuNSA0OCwxOCA0NiwxOS41IDQ2LjUsMTcuNSA0NSwxNiA0NywxNiIvPjxwb2x5Z29uIHBvaW50cz0iNTQsMjQgNTUsMjYgNTcsMjYgNTUuNSwyNy41IDU2LDI5LjUgNTQsMjggNTIsMjkuNSA1Mi41LDI3LjUgNTEsMjYgNTMsMjYiLz48cG9seWdvbiBwb2ludHM9IjQ4LDM0IDQ5LDM2IDUxLDM2IDQ5LjUsMzcuNSA1MCwzOS41IDQ4LDM4IDQ2LDM5LjUgNDYuNSwzNy41IDQ1LDM2IDQ3LDM2Ii8+PHBvbHlnb24gcG9pbnRzPSI0MiwyOCA0MywzMCA0NSwzMCA0My41LDMxLjUgNDQsMzMuNSA0MiwzMiA0MCwzMy41IDQwLjUsMzEuNSAzOSwzMCA0MSwzMCIvPjwvZz48L3N2Zz4=",
  "flag-for-thailand": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0E1MTkzMSIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjgiIHdpZHRoPSI2NCIgaGVpZ2h0PSIzMiIvPjxyZWN0IGZpbGw9IiMyRDJBNEEiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48L3N2Zz4=",
  "flag-for-nigeria": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzAwODc1MSIgd2lkdGg9IjIxLjMiIGhlaWdodD0iNDgiLz48cmVjdCBmaWxsPSJ3aGl0ZSIgeD0iMjEuMyIgd2lkdGg9IjIxLjQiIGhlaWdodD0iNDgiLz48cmVjdCBmaWxsPSIjMDA4NzUxIiB4PSI0Mi43IiB3aWR0aD0iMjEuMyIgaGVpZ2h0PSI0OCIvPjwvc3ZnPg==",
  "flag-for-algeria": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzAwNjIzMyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjQ4Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHg9IjMyIiB3aWR0aD0iMzIiIGhlaWdodD0iNDgiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI0IiByPSI5IiBmaWxsPSIjRDIxMDM0Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSIyNCIgcj0iNy41IiBmaWxsPSJ3aGl0ZSIvPjxwb2x5Z29uIHBvaW50cz0iMzYsMTggMzcuNSwyMiAzNCwyMiIgZmlsbD0iI0QyMTAzNCIvPjwvc3ZnPg==",
  "flag-for-mexico": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iIzAwNjg0NyIgd2lkdGg9IjIxLjMiIGhlaWdodD0iNDgiLz48cmVjdCBmaWxsPSJ3aGl0ZSIgeD0iMjEuMyIgd2lkdGg9IjIxLjQiIGhlaWdodD0iNDgiLz48cmVjdCBmaWxsPSIjQ0UxMTI2IiB4PSI0Mi43IiB3aWR0aD0iMjEuMyIgaGVpZ2h0PSI0OCIvPjwvc3ZnPg==",
  "flag-for-colombia": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0ZDRDExNiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjI0Ii8+PHJlY3QgZmlsbD0iIzAwMzg5MyIgeT0iMjQiIHdpZHRoPSI2NCIgaGVpZ2h0PSIxMiIvPjxyZWN0IGZpbGw9IiNDRTExMjYiIHk9IjM2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTIiLz48L3N2Zz4=",
  "flag-for-uruguay": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0id2hpdGUiIHdpZHRoPSI2NCIgaGVpZ2h0PSI0OCIvPjxnIGZpbGw9IiMwMDM4QTgiPjxyZWN0IHk9IjUuMyIgd2lkdGg9IjY0IiBoZWlnaHQ9IjUuMyIvPjxyZWN0IHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iNS4zIi8+PHJlY3QgeT0iMjYuNyIgd2lkdGg9IjY0IiBoZWlnaHQ9IjUuMyIvPjxyZWN0IHk9IjM3LjMiIHdpZHRoPSI2NCIgaGVpZ2h0PSI1LjMiLz48L2c+PHJlY3QgZmlsbD0id2hpdGUiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjUiIGZpbGw9IiNGQ0QxMTYiLz48L3N2Zz4=",
  "flag-for-ecuador": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0ZGRDEwMCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjI0Ii8+PHJlY3QgZmlsbD0iIzAwMzNBMCIgeT0iMjQiIHdpZHRoPSI2NCIgaGVpZ2h0PSIxMiIvPjxyZWN0IGZpbGw9IiNDRTExMjYiIHk9IjM2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTIiLz48L3N2Zz4=",
  "flag-for-paraguay": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA0OCI+PHJlY3QgZmlsbD0iI0Q1MkIxRSIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PHJlY3QgZmlsbD0id2hpdGUiIHk9IjE2IiB3aWR0aD0iNjQiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjMDAzOEE4IiB5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjE2Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg=="
};

const flagUrl = (iconName) => FLAG_DATA[iconName] || "";

const COUNTRY_DB = {
  China: { id: "156", icon: "flag-for-china" },
  India: { id: "356", icon: "flag-for-india" },
  Russia: { id: "643", icon: "flag-for-russia" },
  Rusia: { id: "643", icon: "flag-for-russia" },
  EEUU: { id: "840", icon: "flag-for-united-states" },
  "United States": { id: "840", icon: "flag-for-united-states" },
  USA: { id: "840", icon: "flag-for-united-states" },
  Iran: { id: "364", icon: "flag-for-iran" },
  "Irán": { id: "364", icon: "flag-for-iran" },
  Indonesia: { id: "360", icon: "flag-for-indonesia" },
  Pakistan: { id: "586", icon: "flag-for-pakistan" },
  "Pakistán": { id: "586", icon: "flag-for-pakistan" },
  Egypt: { id: "818", icon: "flag-for-egypt" },
  Egipto: { id: "818", icon: "flag-for-egypt" },
  Qatar: { id: "634", icon: "flag-for-qatar" },
  "Saudi Arabia": { id: "682", icon: "flag-for-saudi-arabia" },
  "Arabia Saudita": { id: "682", icon: "flag-for-saudi-arabia" },
  Canada: { id: "124", icon: "flag-for-canada" },
  "Canadá": { id: "124", icon: "flag-for-canada" },
  Brazil: { id: "076", icon: "flag-for-brazil" },
  Brasil: { id: "076", icon: "flag-for-brazil" },
  Argentina: { id: "032", icon: "flag-for-argentina" },
  Turkey: { id: "792", icon: "flag-for-turkey" },
  "Turquía": { id: "792", icon: "flag-for-turkey" },
  Australia: { id: "036", icon: "flag-for-australia" },
  Thailand: { id: "764", icon: "flag-for-thailand" },
  Nigeria: { id: "566", icon: "flag-for-nigeria" },
  Algeria: { id: "012", icon: "flag-for-algeria" },
  Argelia: { id: "012", icon: "flag-for-algeria" },
  Mexico: { id: "484", icon: "flag-for-mexico" },
  "México": { id: "484", icon: "flag-for-mexico" },
  Colombia: { id: "170", icon: "flag-for-colombia" },
  Uruguay: { id: "858", icon: "flag-for-uruguay" },
  Ecuador: { id: "218", icon: "flag-for-ecuador" },
  Paraguay: { id: "600", icon: "flag-for-paraguay" }
};

const CENTROIDS = {
  "156": [105, 35],
  "356": [79, 22],
  "643": [100, 60],
  "840": [-97, 38],
  "364": [53, 32],
  "360": [120, -2],
  "586": [70, 30],
  "818": [30, 27],
  "634": [51.2, 25.3],
  "682": [45, 24],
  "124": [-106, 56],
  "076": [-52, -10],
  "032": [-64, -34],
  "792": [35, 39],
  "036": [134, -25],
  "764": [101, 15],
  "566": [8, 10],
  "012": [3, 28],
  "484": [-102, 23],
  "170": [-74, 4],
  "858": [-56, -33],
  "218": [-78, -2],
  "600": [-58, -23]
};

const ANTARCTICA_ID = "010";

const INITIAL_POSITIONS = {
  China: { x: 830, y: 215 },
  India: { x: 780, y: 280 },
  Rusia: { x: 770, y: 88 },
  EEUU: { x: 340, y: 165 },
  "Irán": { x: 590, y: 238 },
  Indonesia: { x: 855, y: 330 },
  "Pakistán": { x: 695, y: 210 },
  Egipto: { x: 530, y: 290 },
  Qatar: { x: 605, y: 395 },
  "Arabia Saudita": { x: 565, y: 350 }
};

const DEFAULT_DATA = [
  { country: "China", value: 34 },
  { country: "India", value: 16 },
  { country: "Rusia", value: 6 },
  { country: "EEUU", value: 5 },
  { country: "Irán", value: 4 },
  { country: "Indonesia", value: 4 },
  { country: "Pakistán", value: 3 },
  { country: "Egipto", value: 3 },
  { country: "Qatar", value: 3 },
  { country: "Arabia Saudita", value: 3 }
];

const BASE_COLOR_HEX = "#4086FF";
const BADGE_STROKE_COLOR = "#4086FF";
const NO_DATA_COLOR = "#EDEDED";
const BG_COLOR = "#F5F1E8";

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const value = c / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1, l2) {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function shouldUseWhiteText(opacity) {
  const base = hexToRgb(BASE_COLOR_HEX);
  const bg = hexToRgb(BG_COLOR);
  const r = Math.round(base.r * opacity + bg.r * (1 - opacity));
  const g = Math.round(base.g * opacity + bg.g * (1 - opacity));
  const b = Math.round(base.b * opacity + bg.b * (1 - opacity));
  const bgLum = luminance(r, g, b);
  return contrastRatio(luminance(255, 255, 255), bgLum) > contrastRatio(luminance(0, 61, 165), bgLum);
}

function decodeTopojson(topo, objectName) {
  const obj = topo.objects[objectName];
  const arcs = topo.arcs;
  const transform = topo.transform;

  function decodeArc(arcIndex) {
    const arc = arcs[arcIndex < 0 ? ~arcIndex : arcIndex];
    let x = 0;
    let y = 0;
    const coords = arc.map((point) => {
      x += point[0];
      y += point[1];
      return [x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]];
    });
    return arcIndex < 0 ? coords.reverse() : coords;
  }

  function decodeRing(ring) {
    let coords = [];
    ring.forEach((arcIndex) => {
      coords = coords.concat(decodeArc(arcIndex));
    });
    return coords;
  }

  return {
    type: "FeatureCollection",
    features: obj.geometries.map((geom) => {
      let coordinates;
      if (geom.type === "Polygon") coordinates = geom.arcs.map(decodeRing);
      else if (geom.type === "MultiPolygon") coordinates = geom.arcs.map((polygon) => polygon.map(decodeRing));
      else coordinates = [];

      return {
        type: "Feature",
        id: geom.id,
        properties: geom.properties || {},
        geometry: { type: geom.type, coordinates }
      };
    })
  };
}

function estimateBadgeWidth(country) {
  return 8 + 24 + 6 + country.length * 7.5 + 6 + 8 + 4;
}

const BADGE_H = 28;
const BADGE_PAD = 6;

function resolveOverlaps(positions, data, iterations = 30) {
  const items = data
    .map((d) => {
      const pos = positions[d.country];
      if (!pos) return null;
      return { country: d.country, x: pos.x, y: pos.y, w: estimateBadgeWidth(d.country), h: BADGE_H };
    })
    .filter(Boolean);

  for (let iter = 0; iter < iterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i];
        const b = items[j];
        const aL = a.x - a.w / 2 - BADGE_PAD;
        const aR = a.x + a.w / 2 + BADGE_PAD;
        const aT = a.y - a.h - BADGE_PAD;
        const aB = a.y + BADGE_PAD;
        const bL = b.x - b.w / 2 - BADGE_PAD;
        const bR = b.x + b.w / 2 + BADGE_PAD;
        const bT = b.y - b.h - BADGE_PAD;
        const bB = b.y + BADGE_PAD;
        if (aL < bR && aR > bL && aT < bB && aB > bT) {
          moved = true;
          const overlapX = Math.min(aR - bL, bR - aL);
          const overlapY = Math.min(aB - bT, bB - aT);
          if (overlapY < overlapX) {
            const pushY = overlapY / 2 + 1;
            if (a.y < b.y) {
              a.y -= pushY;
              b.y += pushY;
            } else {
              a.y += pushY;
              b.y -= pushY;
            }
          } else {
            const pushX = overlapX / 2 + 1;
            if (a.x < b.x) {
              a.x -= pushX;
              b.x += pushX;
            } else {
              a.x += pushX;
              b.x -= pushX;
            }
          }
        }
      }
    }
    if (!moved) break;
  }

  const result = {};
  items.forEach((item) => {
    result[item.country] = { x: Math.round(item.x), y: Math.round(item.y) };
  });
  return result;
}

function FlagIcon({ icon, x, y, w, h }) {
  const clipId = `flag-${icon}-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={w} height={h} rx={4} ry={4} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={4} ry={4} fill="#f0f0f0" />
      <image
        href={flagUrl(icon)}
        x={x + 1}
        y={y + 1}
        width={w - 2}
        height={h - 2}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
      />
    </g>
  );
}

function Slider({ label, value, onChange, min, max, step, unit }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: "#888" }}>{label}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#031A42" }}>
          {value}
          {unit || ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#4086FF", height: 3 }}
      />
    </div>
  );
}

function useMapDrag(setMapOffset) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e) => {
      if (e.target.tagName !== "path" && e.target.tagName !== "svg") return;
      const fill = e.target.getAttribute("fill");
      if (fill === "white") return;
      e.preventDefault();
      setDragging(true);
      startRef.current = { x: e.clientX, y: e.clientY };
      setMapOffset((prev) => {
        offsetRef.current = prev;
        return prev;
      });
    },
    [setMapOffset],
  );

  useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (e) => {
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setMapOffset({ x: offsetRef.current.x + dx * 0.7, y: offsetRef.current.y + dy * 0.7 });
    };

    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, setMapOffset]);

  return { onMouseDown, dragging };
}

function BadgeDraggable({ country, icon, badgeRadius, badgeStroke, onDrag, posX, posY }) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const textRef = useRef(null);
  const [textW, setTextW] = useState(60);

  useEffect(() => {
    if (textRef.current) setTextW(textRef.current.getBBox().width);
  }, [country]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setOffset({ x: e.clientX - posX, y: e.clientY - posY });
  };

  useEffect(() => {
    if (!dragging) return undefined;
    const handleMove = (e) => onDrag(e.clientX - offset.x, e.clientY - offset.y);
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, offset, onDrag]);

  const padX = 8;
  const flagW = 24;
  const flagH = 18;
  const gap = 6;
  const totalW = padX + flagW + gap + textW + padX + 4;
  const badgeH = BADGE_H;
  const badgeX = -totalW / 2;
  const badgeY = -badgeH - 2;

  return (
    <g onMouseDown={handleMouseDown} style={{ cursor: dragging ? "grabbing" : "grab" }}>
      <rect
        x={badgeX}
        y={badgeY}
        width={totalW}
        height={badgeH}
        rx={badgeRadius}
        fill="white"
        stroke={BADGE_STROKE_COLOR}
        strokeWidth={badgeStroke}
      />
      <FlagIcon icon={icon} x={badgeX + padX} y={badgeY + (badgeH - flagH) / 2} w={flagW} h={flagH} />
      <text
        ref={textRef}
        x={badgeX + padX + flagW + gap}
        y={badgeY + badgeH / 2 + 1}
        fontSize={11}
        fontWeight={700}
        fill="#031A42"
        fontFamily="'DM Sans', sans-serif"
        dominantBaseline="central"
        style={{ pointerEvents: "none" }}
      >
        {country}
      </text>
    </g>
  );
}

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [geoData, setGeoData] = useState(null);
  const [labelPositions, setLabelPositions] = useState(INITIAL_POSITIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("PRINCIPALES PRODUCTORES (*)");
  const [source, setSource] = useState("(*) Fuente: IFA 2024.");
  const [copied, setCopied] = useState(false);

  const [strokeWidth, setStrokeWidth] = useState(0.5);
  const [pctSize, setPctSize] = useState(10);
  const [badgeRadius, setBadgeRadius] = useState(10);
  const [badgeStroke, setBadgeStroke] = useState(0.5);
  const [connectorStroke, setConnectorStroke] = useState(0.4);
  const [mapScale, setMapScale] = useState(155);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);
  const width = 960;
  const height = 540;

  const { onMouseDown: onMapMouseDown, dragging: mapDragging } = useMapDrag(setMapOffset);

  const projection = useMemo(
    () => d3.geoNaturalEarth1().scale(mapScale).translate([width / 2 + mapOffset.x, height / 2 + 20 + mapOffset.y]),
    [mapScale, mapOffset],
  );
  const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const geo = decodeTopojson(topo, "countries");
        geo.features = geo.features.filter((f) => String(f.id).padStart(3, "0") !== ANTARCTICA_ID);
        setGeoData(geo);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el mapa.");
        setLoading(false);
      });
  }, []);

  const getCountryCenter = useCallback(
    (countryName) => {
      const info = COUNTRY_DB[countryName];
      if (!info || !CENTROIDS[info.id]) return null;
      const [lon, lat] = CENTROIDS[info.id];
      const [px, py] = projection([lon, lat]);
      return { x: px, y: py };
    },
    [projection],
  );

  useEffect(() => {
    if (!geoData) return;
    const newCountries = data.filter((d) => {
      const info = COUNTRY_DB[d.country];
      return info && getCountryCenter(d.country) && !labelPositions[d.country];
    });
    if (newCountries.length > 0) {
      const updated = { ...labelPositions };
      newCountries.forEach((d) => {
        const center = getCountryCenter(d.country);
        if (center) updated[d.country] = { x: center.x, y: center.y - 35 };
      });
      setLabelPositions(resolveOverlaps(updated, data));
    }
  }, [data, geoData, getCountryCenter, labelPositions]);

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const getOpacity = (val) => (val / maxVal) * 0.8 + 0.2;

  const valueMap = {};
  data.forEach((d) => {
    const info = COUNTRY_DB[d.country];
    if (info) valueMap[info.id] = d.value;
  });

  const updateData = (index, field, value) => {
    setData((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: field === "value" ? Number(value) || 0 : value } : d)),
    );
  };

  const addRow = () => setData((prev) => [...prev, { country: "", value: 0 }]);
  const removeRow = (index) => setData((prev) => prev.filter((_, i) => i !== index));

  const handleLabelDrag = useCallback(
    (country) => (x, y) => {
      setLabelPositions((prev) => ({ ...prev, [country]: { x, y } }));
    },
    [],
  );

  const handleResolveOverlaps = () => {
    setLabelPositions((prev) => resolveOverlaps({ ...prev }, data));
  };

  const handleCopyPositions = () => {
    const lines = data
      .filter((d) => labelPositions[d.country])
      .map(
        (d) =>
          `  "${d.country}": { x: ${Math.round(labelPositions[d.country].x)}, y: ${Math.round(labelPositions[d.country].y)} },`,
      );
    const output = `const INITIAL_POSITIONS = {\n${lines.join("\n")}\n};`;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportSVG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    let svgStr = new XMLSerializer().serializeToString(svgEl);
    svgStr = svgStr.replace(/cursor: ?[a-z-]*/g, "");
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "choropleth_map.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const scale = 3;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "choropleth_map.png";
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  };

  const inputStyle = {
    width: "100%",
    padding: "5px 7px",
    border: "1px solid #e5e5e5",
    borderRadius: 5,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        height: "100vh",
        background: "#f8f7f4",
        color: "#031A42"
      }}
    >
      <div
        style={{
          width: 270,
          padding: "14px 12px",
          borderRight: "1px solid #e0ddd5",
          overflowY: "auto",
          background: "#fff",
          flexShrink: 0
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: "#031A42", letterSpacing: -0.3 }}>
          Bong Map Tool
        </div>

        <div style={{ marginBottom: 10 }}>
          <div
            style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 2 }}
          >
            Titulo
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 2 }}
          >
            Fuente
          </div>
          <input value={source} onChange={(e) => setSource(e.target.value)} style={inputStyle} />
        </div>

        <div
          style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 6 }}
        >
          Controles visuales
        </div>
        <div style={{ background: "#fafaf8", borderRadius: 8, padding: "10px 10px 2px", marginBottom: 6, border: "1px solid #f0ede5" }}>
          <Slider label="Escala mapa" value={mapScale} onChange={setMapScale} min={80} max={400} step={5} unit="" />
          <Slider label="Stroke mapa" value={strokeWidth} onChange={setStrokeWidth} min={0} max={2} step={0.1} unit="px" />
          <Slider label="Tamano %" value={pctSize} onChange={setPctSize} min={6} max={28} step={1} unit="px" />
          <Slider label="Radio badge" value={badgeRadius} onChange={setBadgeRadius} min={2} max={14} step={1} unit="px" />
          <Slider label="Stroke badge" value={badgeStroke} onChange={setBadgeStroke} min={0} max={2} step={0.1} unit="px" />
          <Slider label="Linea conector" value={connectorStroke} onChange={setConnectorStroke} min={0} max={2} step={0.1} unit="px" />
        </div>

        <button
          onClick={() => setMapOffset({ x: 0, y: 0 })}
          style={{
            width: "100%",
            padding: "5px",
            border: "1px solid #e0e0e0",
            borderRadius: 5,
            background: "#fafaf8",
            fontSize: 9,
            fontWeight: 600,
            color: "#666",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 4
          }}
        >
          Reset posicion mapa
        </button>

        <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
          <button
            onClick={handleResolveOverlaps}
            style={{
              flex: 1,
              padding: "5px",
              border: "1px solid #e0e0e0",
              borderRadius: 5,
              background: "#fafaf8",
              fontSize: 9,
              fontWeight: 600,
              color: "#666",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Resolver overlap
          </button>
          <button
            onClick={handleCopyPositions}
            style={{
              flex: 1,
              padding: "5px",
              border: "1px solid #e0e0e0",
              borderRadius: 5,
              background: copied ? "#2D8035" : "#fafaf8",
              fontSize: 9,
              fontWeight: 600,
              color: copied ? "white" : "#666",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s"
            }}
          >
            {copied ? "Copiado" : "Copiar posiciones"}
          </button>
        </div>

        <div
          style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 6 }}
        >
          Datos
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 3, padding: "0 2px" }}>
          <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: "#ccc" }}>PAIS</div>
          <div style={{ width: 40, fontSize: 8, fontWeight: 700, color: "#ccc" }}>%</div>
          <div style={{ width: 18 }} />
        </div>

        {data.map((d, i) => {
          const info = COUNTRY_DB[d.country];
          return (
            <div key={`${d.country}-${i}`} style={{ display: "flex", gap: 3, marginBottom: 2, alignItems: "center" }}>
              {info ? (
                <img
                  src={flagUrl(info.icon)}
                  alt=""
                  style={{ width: 18, height: 14, borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 18, height: 14, borderRadius: 2, background: "#eee", flexShrink: 0 }} />
              )}
              <input
                value={d.country}
                onChange={(e) => updateData(i, "country", e.target.value)}
                placeholder="Pais"
                style={{
                  flex: 1,
                  padding: "4px 5px",
                  border: "1px solid #eee",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  minWidth: 0
                }}
              />
              <input
                type="number"
                value={d.value}
                onChange={(e) => updateData(i, "value", e.target.value)}
                style={{
                  width: 40,
                  padding: "4px 4px",
                  border: "1px solid #eee",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "right"
                }}
              />
              <button
                onClick={() => removeRow(i)}
                style={{
                  width: 18,
                  height: 22,
                  border: "none",
                  background: "transparent",
                  color: "#ccc",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1
                }}
              >
                x
              </button>
            </div>
          );
        })}

        <button
          onClick={addRow}
          style={{
            width: "100%",
            padding: "4px",
            border: "1px dashed #ddd",
            borderRadius: 4,
            background: "transparent",
            fontSize: 10,
            color: "#bbb",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 3,
            marginBottom: 14
          }}
        >
          + Agregar pais
        </button>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={exportSVG}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: 6,
              background: "#4086FF",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Exportar SVG
          </button>
          <button
            onClick={exportPNG}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: 6,
              background: "#2D8035",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Exportar PNG
          </button>
        </div>

        <div style={{ fontSize: 8, color: "#ccc", marginTop: 8, lineHeight: 1.5 }}>
          Banderas: Emoji One v1 (CC BY-SA 4.0). Arrastra el mapa para panear y las etiquetas para reposicionar.
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 14 }}>
        {loading && <div style={{ fontSize: 13, color: "#999" }}>Cargando mapa...</div>}
        {error && <div style={{ fontSize: 13, color: "#e53e3e" }}>{error}</div>}
        {geoData && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{
              width: "100%",
              maxHeight: "100%",
              background: BG_COLOR,
              borderRadius: 6,
              cursor: mapDragging ? "grabbing" : "default"
            }}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            onMouseDown={onMapMouseDown}
          >
            <g>
              {geoData.features.map((feature, i) => {
                const id = String(feature.id).padStart(3, "0");
                const val = valueMap[id];
                const hasData = val !== undefined;
                return (
                  <path
                    key={`feature-${i}`}
                    d={pathGenerator(feature) || ""}
                    fill={hasData ? BASE_COLOR_HEX : NO_DATA_COLOR}
                    fillOpacity={hasData ? getOpacity(val) : 1}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    style={{ cursor: "grab" }}
                  />
                );
              })}
            </g>

            <g style={{ pointerEvents: "none" }}>
              {data.map((d, i) => {
                const info = COUNTRY_DB[d.country];
                const pos = labelPositions[d.country];
                if (!info || !pos) return null;
                const center = getCountryCenter(d.country);
                if (!center) return null;
                const opacity = getOpacity(d.value);
                const useWhite = shouldUseWhiteText(opacity);
                const pctColor = useWhite ? "white" : "#003DA5";
                return (
                  <g key={`conn-${d.country}-${i}`}>
                    {connectorStroke > 0 && (
                      <line
                        x1={pos.x}
                        y1={pos.y}
                        x2={center.x}
                        y2={center.y}
                        stroke="#7a8ba8"
                        strokeWidth={connectorStroke}
                        strokeDasharray="2,2"
                        opacity={0.4}
                      />
                    )}
                    <text
                      x={center.x}
                      y={center.y}
                      fontSize={pctSize}
                      fontWeight={800}
                      fill={pctColor}
                      fontFamily="'DM Sans', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {d.value}%
                    </text>
                  </g>
                );
              })}
            </g>

            <rect x={0} y={0} width={width} height={52} fill={BG_COLOR} opacity={0.92} />
            <text
              x={40}
              y={36}
              fontSize={16}
              fontWeight={700}
              fill="#003DA5"
              fontFamily="'DM Sans', sans-serif"
              style={{ pointerEvents: "none" }}
            >
              {title}
            </text>

            <rect x={0} y={height - 30} width={width} height={30} fill={BG_COLOR} opacity={0.85} />
            <text
              x={width - 40}
              y={height - 14}
              fontSize={10}
              fill="#999"
              fontFamily="'DM Sans', sans-serif"
              textAnchor="end"
              style={{ pointerEvents: "none" }}
            >
              {source}
            </text>

            <g>
              {data.map((d, i) => {
                const info = COUNTRY_DB[d.country];
                const pos = labelPositions[d.country];
                if (!info || !pos) return null;
                return (
                  <g
                    key={`badge-${d.country}-${i}`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <BadgeDraggable
                      country={d.country}
                      icon={info.icon}
                      badgeRadius={badgeRadius}
                      badgeStroke={badgeStroke}
                      onDrag={handleLabelDrag(d.country)}
                      posX={pos.x}
                      posY={pos.y}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
