# for file "if [-f /home/rama/file]"
if [ $1 == "f" ]
then
  if [ -f $2 ]
  then
    echo "true"
  else
    echo "false"
  fi
# for dir "if [-d /home/rama/dir]"
elif [ $1 = "d" ]
then
  if [ -d $2 ]
  then
    echo "true"
  else
    echo "false"
  fi
fi
