// リクエストパラメータのセット
const KEY = '*************************************';     // API KEY
let url = 'https://www.googleapis.com/youtube/v3/search?'; // Google YouTube API URL
url += 'type=video';            // 動画を検索する
url += '&part=snippet';         // 検索結果に階層以下すべてのプロパティを含む
url += '&q=森高千里 私がオバさん 渡良瀬';              // 検索ワード 
url += '&videoEmbeddable=true'; // Webページに埋め込み可能な動画のみを検索
url += '&videoSyndicated=true'; // youtube.com 以外で再生できる動画のみに限定
url += '&maxResults=6';         // 動画の最大取得件数
url += '&key=' + KEY;           // API KEY


let selfilename;
let selpicFlame = document.querySelector('#selpic_disp'); 
document.getElementById('selpic_disp').innerHTML="<p>　</p>"// 選択画面　初期化


// 最初の処理
// HTMLが読み込まれてから実行する処理
// 
$(function() {
  // youtubeの動画を検索して取得
  $.ajax({
    url: url,                   //リクエスト先　'https://www.googleapis.com/youtube/v3/search?'
    dataType : 'jsonp'          //形式　JSON形式
  }).done(function(data) {      //通信OK
    if (data.items) {
      setData(data);            //１データ格納
    } else {
      console.log(data);        //データなし
      alert('該当するデータが見つかりませんでした');
    }
  }).fail(function(data) {      // 通信失敗
    alert('通信に失敗しました');
  });
});

// 
// １データの格納（データ取得が成功したときの処理）
// 
function setData(data) {
  let result_d = '';
  let video  = '';
  // 動画を表示するHTMLを作る
  for (let i = 0; i < data.items.length; i++) {
    video  = '<iframe src="https://www.youtube.com/embed/';
    video  +=  data.items[i].id.videoId;
    video  +=  '" rameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    video  += '" allowfullscreen></iframe>';   //iframeでYOUTUBE映像を表示
    result_d += '<div class="video">' + video +'<button id="capture">キャプチャー</button>'+' <a href="" id="download" download="img/test.jpg">ダウンロード</a>';
    result_d += '<canvas id="canvas">';
    result_d += '</canvas>'+'</div>';
  }

  // １のつづき（受信でーたをHTMLに反映する）
  $('#videoList').html(result_d);

}

  // ファイル選択が押されたとき
  $('#filename1').on("change", function() {
    var file = this.files[0];
    if(file != null) {
    document.getElementById("dummy_file").value = file.name; //file.nameをdummy_fileへ返す
    }
    //  console.log(file.name);
    selfilename="img/" + file.name;
console.log(selfilename);

    //選択画像表示 
    document.getElementById('selpic_disp').innerHTML="<p>選んだ写真</p>"

    let thumbImage = document.createElement('img');
    thumbImage.setAttribute('src', selfilename);
    thumbImage.setAttribute('alt', "");
    selpicFlame.insertBefore(thumbImage, null);    

});



// 
// Cloud VIsio API
// 
//section 1
//APIを利用する際のURL
var url2 = 'https://vision.googleapis.com/v1/images:annotate?key=' //API URL
var api_url = url2 + KEY

//section 2
//ページを読み込む際に動的にラベル検出結果表示用のテーブルを作成
$(function(){
    for (var i =0; i < 10; i++){
        $("#resultBox").append("<tr><td class='resultTableContent'></td></tr>")
    }
})

//section 3
//画面の表示内容をクリアする処理
function clear(){
    if($("#textBox tr").length){
        $("#textBox tr").remove();
    }
    $("#resultBox tr td").text("")
}

//section 4
//画像がアップロードされた時点で呼び出される処理
// $("#uploader").change(function(evt){
    $('input').change(function(evt){
    getImageInfo(evt);
    clear();                                //TEXTエリアをクリア
    $(".resultArea").removeClass("hidden")
})

//section 5
//画像ファイルを読み込み、APIを利用するためのURLを組み立てる
function getImageInfo(evt){
    var file = evt.target.files;
    var reader = new FileReader();
    var dataUrl = "";
    reader.readAsDataURL(file[0]);
    reader.onload = function(){
        dataUrl = reader.result;
        // $("#showPic").html("<img src='" + dataUrl + "'>");
        makeRequest(dataUrl,getAPIInfo);
    }
}

//section 6
//APIへのリクエストに組み込むJsonの組み立て
function makeRequest(dataUrl,callback){
    var end = dataUrl.indexOf(",")
    var request = "{'requests': [{'image': {'content': '" + dataUrl.slice(end + 1) + "'},'features': [{'type': 'LABEL_DETECTION','maxResults': 10,},{'type': 'FACE_DETECTION',},{'type':'TEXT_DETECTION','maxResults': 20,}]}]}"
    callback(request)
}

//section 7
//通信を行う
function getAPIInfo(request){
    $.ajax({
        url : api_url,
        type : 'POST',       
        async : true,        
        cashe : false,
        data: request, 
        dataType : 'json', 
        contentType: 'application/json',   
    }).done(function(result){
        showResult(result);
    }).fail(function(result){
        alert('failed to load the info');
    });  
}

//section 8
//得られた結果を画面に表示する
function showResult(result){
    //ラベル検出結果の表示
    for (var i = 0; i < result.responses[0].labelAnnotations.length;i++){
        $("#resultBox tr:eq(" + i + ") td").text(result.responses[0].labelAnnotations[i].description)
    }
    //表情分析の結果の表示
    if(result.responses[0].faceAnnotations){
        //この変数に、表情のlikelihoodの値を配列として保持する
        var facialExpression = [];
        facialExpression.push(result.responses[0].faceAnnotations[0].joyLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].sorrowLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].angerLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].surpriseLikelihood);
        facialExpression.push(result.responses[0].faceAnnotations[0].headwearLikelihood);
        for (var k = 0; k < facialExpression.length; k++){
            if (facialExpression[k] == 'UNKNOWN'){
                facialExpression[k] = 0;
            }else if (facialExpression[k] == 'VERY_UNLIKELY'){
                facialExpression[k] = 2;
            }else if (facialExpression[k] == 'UNLIKELY'){
                facialExpression[k] = 4;
            }else if (facialExpression[k] == 'POSSIBLE'){
                facialExpression[k] = 6;
            }else if (facialExpression[k] == 'LIKELY'){
                facialExpression[k] = 8;
            }else if (facialExpression[k] == 'VERY_LIKELY'){
                facialExpression[k] = 10;
            }
        }
 
     }else{
      
    }


    //テキスト解読の結果を表示
    if(result.responses[0].textAnnotations){
        for (var j = 1; j < result.responses[0].textAnnotations.length; j++){
            if(j < 16){
                $("#textBox").append("<tr><td class='resultTableContent'>" + result.responses[0].textAnnotations[j].description + "</td></tr>")
            }
        }
    }else{
        //テキストに関する結果が得られなかった場合、表示欄にはその旨を記す文字列を表示
        $("#textBox").append("<tr><td class='resultTableContent'><b>No text can be found in the picture</b></td></tr>")
    }
}

// 
// 
// 

// 
// チャプチャー
// 
var $canvas ;
$('#capture').on('click', function(){
  var video = document.getElementById('video');
  $canvas = $('#canvas');
  
  $canvas.attr('width', video.videoWidth);
  $canvas.attr('height', video.videoHeight);
  $canvas[0].getContext('2d').drawImage(video, 0, 0, $canvas.width(), $canvas.height());

 

});

$('#download').on('click', function(){
    console.log("download click");
attr('href', $canvas[0].toDataURL('img/jpeg',0.75));
console.log($canvas[0].toDataURL); //base64でデータ化

});

// 
// 
// 

