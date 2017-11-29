#!/bin/sh

sed -i -e 's/    it/test/g' $1 
sed -i -e 's/    })/})/g' $1 
sed -i -e 's/      expect/  t.is/g' $1 
sed -i -e 's/).toBeTruthy(/, true/g' $1 
sed -i -e 's/).toBeFalsy(/, false/g' $1 
sed -i -e 's/).toBeUndefined(/, undefined/g' $1 
sed -i -e 's/).toEqual(/, /g' $1 
sed -i -e 's/function()/t =>/g' $1 
sed -i -e 's/t =>{/t => {/g' $1 
sed -i -e 's/var /let /g' $1 

