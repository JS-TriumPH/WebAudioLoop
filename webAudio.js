

window.addEventListener("load", init);



function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    }
    catch (e) {

        alert('MLGB 你的浏览器连个Web-Audio-API 都不支持！！')
    }

    
    
}



function decodePCM() {
    var file = document.getElementById("file").files[0];
    var reader = new FileReader();
    //将文件以二进制形式读入页面 
    reader.readAsArrayBuffer(file);
    reader.onload = function (data) {
        var result = new Int32Array(data.target.result);
        analyticPCMBuffer(result);      
    }
}






  //解析二进制数据
function analyticPCMBuffer(dataBuffer) {
    var audioCtx = new AudioContext();
    var audioLen = dataBuffer.length;
    var time = audioLen / 44100;
    var fragmentTime = 50;
    var chunkNum = Math.floor(time * 1000 / fragmentTime); //fragmentTime ms一个片段
    var fragmentLen = Math.floor(audioLen / chunkNum);
    var fragmentSound = new Int32Array(fragmentLen);
    var audioBuffer = audioCtx.createBuffer(1, 2 * fragmentLen, 44100);
    var ptr = 0;

    var source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    source.connect(audioCtx.destination);
    source.start(0);

    var currentTime = 0;
    var now;
    var start = Date.now();
    var iFrame = 0;

    (function tick() {
        myReq = requestAnimationFrame(tick);
        now = Date.now();
        currentTime = now - start;

        if (currentTime >= fragmentTime * iFrame - 30) {
            rewriteBuffer();
            iFrame++;
        }

        if (iFrame >= chunkNum) {
            cancelAnimationFrame(myReq);
            source.stop(0);
        }
    })();




    function rewriteBuffer() {
        var start = iFrame * fragmentLen;
        var nowBuffering = audioBuffer.getChannelData(0);
        fragmentSound = dataBuffer.slice(start, start + fragmentLen);
        if (ptr == 0) {
            for (var i = 0; i < fragmentLen; i++) {
                nowBuffering[i] = fragmentSound[i] / 2147483648;
            }
            ptr = 1;
        }
        else if (ptr == 1) {
            for (var i = 0; i < fragmentLen; i++) {
                nowBuffering[i + fragmentLen] = fragmentSound[i] / 2147483648;
            }
            ptr = 0;
        }
        
    }
  }


  
