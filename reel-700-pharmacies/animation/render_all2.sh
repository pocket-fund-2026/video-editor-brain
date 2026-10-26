#!/bin/bash
cd /root/reel4; rm -rf out2
for id in A_headline B_map C_years D_year E_end; do python3 render2.py $id; done
echo ALLDONE
