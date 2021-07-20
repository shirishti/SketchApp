import React, { useRef, useEffect } from "react";
import io from "socket.io-client";
import "./styles/board.css";

const Board = () => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const socketRef = useRef();
  // let recentWords=[];
  // let undoList=[];

  // useEffect(()=>{
  //   console.log("hi");
  //
  //   var canvas=document.getElementById("canvas");
  //
  //
  //   const context = canvas.getContext('2d');
  //
  //   var mouseX=0;
  //   var mouseY=0;
  //   var startingX=0;
  //
  //
  //
  //   function saveState(){
  //     undoList.push(canvas.toDataURL());
  //   }
  //
  //   saveState();
  //
  //   function undo(){
  //     undoList.pop();
  //
  //     var imgData=undoList[undoList.length-1];
  //
  //     var image=new Image();
  //
  //     image.src=imgData;
  //     image.onload=function(){
  //       context.clearRect(0,0,canvas.width,canvas.height);
  //       context.drawImage(image,0,0,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
  //     }
  //   }
  //
  //
  //   canvas.addEventListener("click",function(e){
  //   mouseX=e.pageX-canvas.offsetLeft;
  //   mouseY=e.pageY-canvas.offsetTop;
  //   startingX=mouseX;
  //
  //   recentWords=[];
  //     return false;
  //   },false);
  //
  //   document.addEventListener("keydown",function(e){
  //     context.font="16px Arial";
  //
  //     if(e.keyCode===8){
  //       undo();
  //
  //       var recentWords=recentWords[recentWords.length-1];
  //
  //       mouseX-=context.measureText(recentWords).width;
  //       recentWords.pop();
  //     }
  //     else if(e.keyCode===13){
  //       mouseX=startingX;
  //       mouseY+=20;
  //     }else{
  //       context.fillText(e.key,mouseX,mouseY);
  //
  //       mouseX+=context.measureText(e.key).width;
  //
  //       saveState();
  //
  //       recentWords.push(e.key);
  //     }
  //   },false);
  // })

  useEffect(() => {
    // --------------- getContext() method returns a drawing context on the canvas-----
    const canvas = canvasRef.current;

    const test = colorsRef.current;
    const context = canvas.getContext("2d");

    // ----------------------- Colors --------------------------------------------------

    const colors = document.getElementsByClassName("color");
    console.log(colors, "the colors");
    console.log(test);
    // set the current color
    const current = {
      color: "black",
    };

    // helper that will update the current color
    const onColorUpdate = (e) => {
      current.color = e.target.className.split(" ")[1];
    };

    // loop through the color elements and add the click event listeners
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener("click", onColorUpdate, false);
    }
    let drawing = false;

    // ------------------------------- create the drawing ----------------------------

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      socketRef.current.emit("drawing", {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
      });
    };

    // ---------------- mouse movement --------------------------------------

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
    };

    // ----------- limit the number of events per second -----------------------

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();

        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    // -----------------add event listeners to our canvas ----------------------

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    // Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    // -------------- make the canvas fill its parent component -----------------

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      console.log(data);
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    socketRef.current = io.connect("/");
    socketRef.current.on("drawing", onDrawingEvent);
  }, []);

  const saveImg = () => {
    console.log("hi ji");
    var canvas = document.getElementById("canvas");
    var dataURL = canvas.toDataURL();

    console.log(dataURL);
  };

  // ------------- The Canvas and color elements --------------------------

  // set canvasImg image src to dataURL

  return (
    <div className="main">
      <div>
        <div>
          <canvas ref={canvasRef} className="whiteboard" id="canvas" />

          <div ref={colorsRef} className="colors">
            <div className="color black" />
            <div className="color red" />
            <div className="color green" />
            <div className="color blue" />
            <div className="color yellow" />
          </div>
        </div>
      </div>
      <button className="btn" onClick={() => saveImg()}>
        Save
      </button>
    </div>
  );
};

export default Board;
