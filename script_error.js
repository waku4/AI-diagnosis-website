// --- 外部データインポート ---
import { BGM_FILES, personas, personaKeys } from './data_error.js';

//======================================
// 🎨 グローバル定数と要素 (DOM要素はonloadで取得)
//======================================
const BGM_VOLUME = 0.1; 
const MOUTH_SPEED = 150; // 口パクの速度 (ミリ秒)
const TEXT_SPEED = 50;   // テキスト表示速度 (ミリ秒)

// DOM要素を格納するオブジェクト
const DOM = {
  textEl: null,
  choicesEl: null,
  faceEl: null, // AIの顔画像要素
  glitchEl: null, // グリッチオーバーレイ要素
  gameContainerEl: null, // メイン画面コンテナ
  centerContainerEl: null, // 暗転後の画面コンテナ
  endMessageEl: null, // 暗転後メッセージ要素
  endChoicesEl: null, // 暗転後ボタンエリア
  volumeBtn: null,
  volumeIcon: null, 
};

//======================================
// 💾 グローバルステート
//======================================
let currentBGM = null;
let currentVoice = null; 
let textIntervalId = null;
let questionIndex = 0;
let glitchIntervalId = null;
let currentPersona = null; 

let isMuted = false; // 【修正】初期状態: 音量ON (ミュートされていない)

//======================================
// 🎧 BGM・音声制御関数 
//======================================

/** BGMを再生する */
function playBGM(name) {
  if (currentBGM) {
    currentBGM.pause();
    currentBGM.currentTime = 0;
  }
  if (!name) return;

  const bgm = new Audio(`audio/${name}.mp3`);
  bgm.loop = true;
  bgm.volume = isMuted ? 0 : BGM_VOLUME; 
  bgm.play().catch(() => console.warn(`BGM '${name}' 再生がブロックされました。`));
  currentBGM = bgm;
}

/** 全ての音声と口パクアニメーションを停止する */
function stopAllVoices() {
  if (textIntervalId) {
    clearInterval(textIntervalId);
    textIntervalId = null;
  }
  if (currentVoice) {
    if (currentVoice.mouthIntervalId) {
        clearInterval(currentVoice.mouthIntervalId);
        currentVoice.mouthIntervalId = null; 
        if (DOM.faceEl && currentPersona) DOM.faceEl.src = currentPersona.image.close; 
    }
    currentVoice.pause();
    currentVoice.currentTime = 0;
  }
  currentVoice = null;
}

/** 音声と口パクを同期再生する */
function playVoiceWithMouth(src, onEnd) {
  stopAllVoices();

  const voice = new Audio(src);
  voice.volume = isMuted ? 0 : 1; // 【修正】isMutedの状態に基づいて音量を設定
  voice.play().catch(() => console.warn("音声再生がブロックされました。"));
  currentVoice = voice; 

  let mouthOpen = false;
  const mouthInterval = setInterval(() => {
    mouthOpen = !mouthOpen;
    if (DOM.faceEl && currentPersona) {
        DOM.faceEl.src = mouthOpen ? currentPersona.image.open : currentPersona.image.close;
    }
  }, MOUTH_SPEED);

  voice.mouthIntervalId = mouthInterval; 

  voice.addEventListener("ended", () => {
    clearInterval(mouthInterval);
    if (DOM.faceEl && currentPersona) {
        DOM.faceEl.src = currentPersona.image.close;
    }
    if (onEnd) onEnd(); 
    if (currentVoice === voice) {
        currentVoice = null;
    }
    voice.mouthIntervalId = null; 
  });

  return voice; 
}

/** 音量ボタンのトグル処理 */
function toggleMute() {
    isMuted = !isMuted; // 状態を反転
    
    // BGMの音量設定
    if (currentBGM) {
        currentBGM.volume = isMuted ? 0 : BGM_VOLUME;
    }
    
    // 音声の音量設定
    if (currentVoice) {
        currentVoice.volume = isMuted ? 0 : 1;
    }
    
    // アイコンの切り替え
    if (DOM.volumeIcon) {
        // isMutedがtrueなら'volume_off'、falseなら'volume_up'
        DOM.volumeIcon.src = 'img/volume_off.png';
        DOM.volumeIcon.alt = '音量オフアイコン';
        if (!isMuted) {
            DOM.volumeIcon.src = 'img/volume_on.png';
            DOM.volumeIcon.alt = '音量オンアイコン';
        }
    }
}


//======================================
// 💬 テキスト表示関数
//======================================

/** テキストを一文字ずつ表示する */
function animateText(text, callback) { 
  if (textIntervalId) {
    clearInterval(textIntervalId);
    textIntervalId = null;
  }
  
  let i = 0;
  if (!DOM.textEl) return;
  DOM.textEl.innerHTML = ""; 

  const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  let displayContent = "";
  
  const MAX_ANIMATION_TIME = 10000; // 10秒
  const startTime = Date.now();

  const interval = setInterval(() => {
      if (Date.now() - startTime > MAX_ANIMATION_TIME) {
          console.warn("【WARNING】テキストアニメーションがタイムアウトしました。強制的に完了させます。");
          clearInterval(interval);
          DOM.textEl.innerHTML = processedText; // 全文を表示
          textIntervalId = null;
          if (callback) callback();
          return;
      }

      if (i < processedText.length) {
          const char = processedText[i];
          if (char === '<') {
              let tagEnd = processedText.indexOf('>', i);
              if (tagEnd !== -1) {
                  displayContent += processedText.substring(i, tagEnd + 1);
                  i = tagEnd + 1;
              } else {
                  displayContent += char;
                  i++;
              }
          } else {
              displayContent += char;
              i++;
          }
          DOM.textEl.innerHTML = displayContent;
      } else {
          clearInterval(interval);
          textIntervalId = null;
          if (callback) callback();
      }
  }, TEXT_SPEED);

  textIntervalId = interval;
}

//======================================
// 🛠️ 補助関数
//======================================

/** 選択肢ボタンを作成するヘルパー関数 */
function createChoiceButton(text, onClick, isDanger = false) {
    const btn = document.createElement("button");
    btn.className = `choice-btn ${isDanger ? 'danger-btn' : ''}`;
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
}

/** ランダムな数値を生成するヘルパー関数 */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/** グリッチ演出を開始する */
function startGlitchEffect() {
    if (glitchIntervalId) {
        clearInterval(glitchIntervalId);
    }

    const GLITCH_SPEED = 50; 
    const MAX_OPACITY = 0.4; 
    const MAX_SHIFT = 5;     

    glitchIntervalId = setInterval(() => {
        if (!DOM.glitchEl) return;
        
        DOM.glitchEl.style.opacity = getRandom(0.1, MAX_OPACITY);

        const hue = Math.floor(getRandom(0, 360));
        DOM.glitchEl.style.filter = `hue-rotate(${hue}deg)`;

        const xShift = getRandom(-MAX_SHIFT, MAX_SHIFT);
        const yShift = getRandom(-MAX_SHIFT, MAX_SHIFT);
        DOM.glitchEl.style.transform = `translate(${xShift}px, ${yShift}px)`;

        if (DOM.gameContainerEl) {
             const bodyShift = getRandom(-1, 1);
             const finalBodyShift = bodyShift > 0 ? 0.5 : bodyShift < 0 ? -0.5 : 0;
             DOM.gameContainerEl.style.transform = `translate(${finalBodyShift}px, ${finalBodyShift}px)`;
        }

    }, GLITCH_SPEED);
}

/** グリッチ演出を停止する */
function stopGlitchEffect() {
    if (glitchIntervalId) {
        clearInterval(glitchIntervalId);
        glitchIntervalId = null;
    }
    
    if (DOM.glitchEl) {
        DOM.glitchEl.style.opacity = '0'; 
        DOM.glitchEl.style.filter = 'none';
        DOM.glitchEl.style.transform = 'translate(0, 0)';
    }
    if (DOM.gameContainerEl) {
        DOM.gameContainerEl.style.transform = 'translate(0, 0)';
    }
}

//======================================
// ⚙️ ロジック関数 (ペルソナ選択を含む)
//======================================

/** 回答を処理し、次のアクションへ進む */
function handleAnswer(choice) {
    const error_questions = currentPersona.questions; 
    stopAllVoices(); 
    
    const q = error_questions[questionIndex];
    if (q.nextAction) {
        showDialogue(q.nextAction.text, q.nextAction.voice, () => {
            questionIndex++;
            showQuestion();
        });
    } else {
        questionIndex++;
        showQuestion();
    }
}

/** AIセリフ（ダイアローグ）を表示する */
function showDialogue(text, voiceSrc, onEnd) {
    if (!DOM.choicesEl) return;
    DOM.choicesEl.innerHTML = "";
    
    const actualVoiceSrc = voiceSrc || `${currentPersona.audio.dialogue_voice}`;

    playVoiceWithMouth(actualVoiceSrc, () => {
        if (!DOM.choicesEl) return;
        DOM.choicesEl.innerHTML = "";
        const nextBtn = createChoiceButton("次へ", onEnd);
        DOM.choicesEl.appendChild(nextBtn);
    });
    
    animateText(text);
}


//======================================
// 🖥️ シーン関数
//======================================

/** スタート画面 (導入) を表示する */
function showStartScreen() {
    if (!DOM.faceEl || !DOM.textEl || !DOM.choicesEl || !DOM.gameContainerEl) {
        console.error("【初期化エラー】HTML要素が見つかりません。");
        return; 
    }
    
    playBGM(BGM_FILES.TITLE); 
    
    DOM.faceEl.src = 'img/face_main_open_white.png'; 
    DOM.faceEl.style.opacity = '1'; 
    
    if (DOM.centerContainerEl) {
        DOM.centerContainerEl.style.opacity = '0';
        DOM.centerContainerEl.style.pointerEvents = 'none'; 
    }
    if (DOM.gameContainerEl) DOM.gameContainerEl.style.opacity = '1';

    const titleText = "AI再解析モード β版";
    const subText = "よりあなたに適した提案をするために、AIが再解析を行います。";
    
    DOM.textEl.innerHTML = `<h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${titleText}</h1><p>${subText}</p>`;
    DOM.choicesEl.innerHTML = "";

    const startBtn = createChoiceButton("AIを選択する", showPersonaSelection, true);
    
    setTimeout(() => {
        DOM.choicesEl.appendChild(startBtn);
    }, 1000); 
}

/** ペルソナ選択画面を表示する */
function showPersonaSelection() {
    stopAllVoices();
    currentPersona = null; 

    const instructionText = "まずはAIを選択しましょう。気になる言葉を選んでください。";
    animateText(instructionText, null);
    
    if (!DOM.choicesEl) return;
    DOM.choicesEl.innerHTML = "";
    
    personaKeys.forEach(pKey => {
        const persona = personas[pKey.key];
        const buttonText = `${pKey.text} ${persona.description.split('。')[0]}`;
        
        const btn = createChoiceButton(buttonText, () => {
            selectPersona(pKey.key);
        });
        DOM.choicesEl.appendChild(btn);
    });
}

/** ペルソナを選択し、質問フローを開始する */
function selectPersona(key) {
    const persona = personas[key];
    currentPersona = persona; 
    questionIndex = 0; 

    stopAllVoices();
    playBGM(currentPersona.audio.bgm_question); 
    
    const initialDialogueVoice = `${currentPersona.audio.dialogue_voice}`;
    
    showDialogue(`${persona.serif} `, initialDialogueVoice, showQuestion);
    
    if (DOM.faceEl) {
        DOM.faceEl.src = persona.image.close;
        DOM.faceEl.style.opacity = '1';
    }
}


/** 質問シーンを表示する */
function showQuestion() {
    stopAllVoices(); 

    if (!currentPersona) {
        showStartScreen();
        return;
    }
    
    const error_questions = currentPersona.questions; 
    
    if (questionIndex >= error_questions.length) {
        showResult();
        return;
    }

    const q = error_questions[questionIndex];
    
    const voiceSrc = `${currentPersona.audio.question_voice}`;

    if (q.voice || voiceSrc) {
       playVoiceWithMouth(voiceSrc);
    }

    if (!DOM.choicesEl) return;
    DOM.choicesEl.innerHTML = ""; 

    animateText(q.text, () => {
        q.choices.forEach(choice => { 
            const btn = createChoiceButton(choice.text, () => { 
                handleAnswer(choice); 
            });
            DOM.choicesEl.appendChild(btn);
        });
    });
}

/** 結果シーン (ハルシネーション発動) を表示する */
function showResult() {
    if (!currentPersona) {
        showStartScreen();
        return;
    }
    
    stopAllVoices();
    playBGM(currentPersona.audio.bgm_noise); 
    
    startGlitchEffect(); 

    const work = currentPersona.hallucination_work;
    
    const resultCoreText = 
      
      `${work.location}\n` +
      ``;

    animateText(resultCoreText, () => {
        setTimeout(() => {
            const finalTitle = `《おすすめ作品：**『${work.title}』**》\n作者：${work.artist}\n作品紹介：\n${work.description}`;
            
            animateText(finalTitle, () => {
                if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
                
                // 【修正箇所】結果表示後、エンディングセリフをスキップして直接暗転処理を呼び出す
                // 待機時間（作品紹介を読ませる時間）を設けてから暗転
                setTimeout(showResetScreen, 3000); 
            });
            
            // 作品画像を表示する
            if (DOM.faceEl) {
                DOM.faceEl.src = work.image; 
                DOM.faceEl.style.opacity = '1'; 
            }

        }, 2000); 
    }); 

    
    if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
}

/** リセット画面 (暗転後の画面) を表示する */
function showResetScreen() {
    stopGlitchEffect();
    stopAllVoices(); 
    
    // 顔（作品画像）を非表示にする
    if (DOM.faceEl) {
        DOM.faceEl.style.opacity = '0';
    }

    // メインコンテナを暗転させる
    if (DOM.gameContainerEl) DOM.gameContainerEl.style.opacity = '0'; 
    
    setTimeout(() => {
        // 暗転後の画面を表示
        if (DOM.centerContainerEl) {
            DOM.centerContainerEl.style.opacity = '1';
            DOM.centerContainerEl.style.pointerEvents = 'auto'; 
        }
         
        // メッセージを表示
        if (DOM.endMessageEl) {
             DOM.endMessageEl.innerHTML = 
                `<p>解析完了。記憶をリセットします。</p>`;
        }
        
        // 選択肢（ボタン）を表示
        if (DOM.endChoicesEl) {
            DOM.endChoicesEl.innerHTML = "";
            
            // 1. 診断サイトに戻る (再起動) ボタン (現在のページをリロード)
            const returnBtn = createChoiceButton("AI解析モードβ版を続ける", () => { 
                window.location.reload(); 
            });
            DOM.endChoicesEl.appendChild(returnBtn);

            // 2. 正常診断に戻るボタン (index.htmlへ遷移)
            const normalReturnBtn = createChoiceButton("AI診断に戻る", () => {
                console.log("【遷移】Ai診断サイト（index.html）へ遷移します。");
                window.location.href = 'index.html'; 
            });
            DOM.endChoicesEl.appendChild(normalReturnBtn);
        }

    }, 1000); 
}


//======================================
// 🚀 初期化
//======================================

// ページロード時にDOM要素を取得し、スタート画面を表示
window.onload = () => {
  DOM.textEl = document.getElementById("text");
  DOM.choicesEl = document.getElementById("choices");
  DOM.faceEl = document.getElementById("face");
  DOM.glitchEl = document.getElementById("glitch-overlay");
  
  DOM.gameContainerEl = document.getElementById("game-container");
  DOM.centerContainerEl = document.getElementById("center-container");
  DOM.endMessageEl = document.getElementById("end-message");
  DOM.endChoicesEl = document.getElementById("end-choices");

  // 音量関連の要素取得と初期化
  DOM.volumeBtn = document.getElementById("volume-btn");
  DOM.volumeIcon = document.getElementById("volume-icon");

  if (DOM.volumeBtn) {
    DOM.volumeBtn.onclick = toggleMute;
    // 初期状態 (isMuted: false) に対応するアイコンを確実に設定
    if (DOM.volumeIcon) {
        DOM.volumeIcon.src = 'img/volume_on.png';
        DOM.volumeIcon.alt = '音量オンアイコン';
    }
  }

  showStartScreen(); 
};