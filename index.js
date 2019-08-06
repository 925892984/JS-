window.onload = function () {

  function Main(tr, td, num) {
    this.tr = tr;
    this.td = td;
    this.num = num;

    this.msg = [];
    this.tds = [];
    this.minNum = num;
    this.success = false;

    this.box = document.querySelector('.game_box');

  }
  //创建格子
  Main.prototype.createDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) {
      var tr = document.createElement('tr');
      this.tds[i] = []
      for (var j = 0; j < this.td; j++) {
        var td = document.createElement('td');
        
        td.value = [i,j];
        td.onmousedown=function(){
          This.play(event,this)
        }
        this.tds[i][j] = td;

        // if(this.msg[i][j].type == 'mine'){
        //   td.className = 'mine';
        // }else{
        //   td.innerHTML=this.msg[i][j].value;
        // }

        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.box.innerHTML = '';
    this.box.appendChild(table);


  }
  //创建随机数，选出存放雷的格子
  Main.prototype.randomNum = function () {
    var square = Array(this.tr * this.td);
    for (var i = 0; i < square.length; i++) {
      square[i] = i;
    }
    square.sort(function () {
      return 0.5 - Math.random();
    });
    return square.slice(0,this.num);
  }
  //
  Main.prototype.info = function(){
    //返回长的为10的数组，
    var vn = this.randomNum();
    var num=0;

    for(var i=0;i<this.tr;i++){
      this.msg[i] = []
      for(var j=0;j<this.td;j++){
        if(vn.indexOf(num)!=-1){
          this.msg[i][j] = {
            type:'mine',
            x:j,
            y:i
          }
        }else {
          this.msg[i][j]={
            type:'number',
            x:j,
            y:i,
            value:0
          }
        }
        num++;
      }
    }
    this.createDom();
    this.updataNum();
    //阻止右键的默认事件
    this.box.oncontextmenu = function(){
      return false;
    }
    this.mineNum = document.querySelector('.num');
    this.mineNum.innerHTML=this.minNum;

  }
  //找九宫格
  Main.prototype.getAround = function(array){
    var x = array.x;
    var y = array.y;
    var result = [];

    for(var i=x-1;i<=x+1;i++){
      for(var j=y-1;j<=y+1;j++){
        if(
          i<0 ||
          j<0 ||
          i>this.td-1 ||
          j>this.tr-1 ||
          (i==x && j==y) ||
          this.msg[j][i].type=='mine')
          {
          continue
        }
        result.push([j,i])
      }
    }
    return result;
  }
  //更新数据。
  Main.prototype.updataNum = function(){
    for(var i=0;i<this.tr;i++){
      for(var j=0;j<this.td;j++){
        if(this.msg[i][j].type=='number'){
          continue;
        }
        var arr = this.getAround(this.msg[i][j]);   //k为雷旁边的数字的坐标数组集合

        for(var k=0;k<arr.length;k++){
          // arr[k]=[0,1]
          // k[0][0] = 0
          // k[0][1] = 1 
          this.msg[arr[k][0]][arr[k][1]].value+=1;
        }
      }
    }
  }
  //控制玩家点击和与玩家交互
  Main.prototype.play=function(ev,obj){
    var This = this;
    //点击的是左键的时候
    if(ev.which == 1 && obj.className != 'flag'){
      // console.log(obj);
      var curSquare = this.msg[obj.value[0]][obj.value[1]];
      var cl = ['zero','one','two','three','four','five','six','seven','eight'];

      if(curSquare.type == 'number'){
        obj.innerHTML=curSquare.value;
        obj.className = cl[curSquare.value];
        if(curSquare.value==0){
          obj.innerHTML = '';

          function getAllZero(arr){
            var result = This.getAround(arr);
            for(var i=0;i<result.length;i++){
              var x = result[i][0];
              var y = result[i][1];

              This.tds[x][y].className = cl[This.msg[x][y].value];

              if(This.msg[x][y].value == 0){
                if(!This.tds[x][y].check){
                This.tds[x][y].check=true;
                getAllZero(This.msg[x][y]);
                }
              }
              else{
                This.tds[x][y].innerHTML = This.msg[x][y].value;
              }
            }
          }
          getAllZero(curSquare);
        }
      }else{
          this.gameover(obj);
      }
    }
    if(ev.which==3){
      if(obj.className && obj.className!='flag'){
        return;
      }
      obj.className = obj.className=='flag'?'':'flag';
      if(obj.className=='flag'){
        this.mineNum.innerHTML=--this.minNum;
      }else{
        this.mineNum.innerHTML=++this.minNum;
      }
      if(this.msg[obj.value[0]][obj.value[1]].type=='mine'){
        this.success = true;
      }else{
        this.success=false;
      }
      if(this.minNum==0){
        if(this.success){
          alert('恭喜你，成功了！');
        }else{
          alert('挑战失败！');
          this.gameover();
        } 
      }
    }
  }
  //游戏结束显示所有的雷，点击的雷颜色变红
  Main.prototype.gameover=function(thisTd){
    for(var i=0;i<this.tr;i++){
      for(var j=0;j<this.td;j++){
        if(this.msg[i][j].type == 'mine'){
          this.tds[i][j].className = 'mine';
        }
        this.tds[i][j].onmousedown = null;
      }
    }
    if(thisTd){
      thisTd.style.background='#f00';
    }
  }

  var btns = document.querySelectorAll('button');
  var mine = null;
  var ln = 0;
  var arr = [[9,9,10],[16,16,40],[28,28,99]];

  for(let i=0;i<btns.length-1;i++){
    btns[i].onclick = function(){
      btns[ln].className='';
      btns[i].className = 'active';

      mine = new Main(...arr[i]);
      mine.info();

      ln = i;
    }
  }
  var mineNum = document.querySelector('.num');
  // this.mineNum.innerHTML=this.minNum;
  btns[0].onclick();
  btns[3].onclick = function(){
    mine.info();
    mineNum.innerHTML=arr[ln][2];
  }

  // var main = new Main(10, 10, 10);
  // main.info();
}