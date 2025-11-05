import { questions, works } from './data.js';

//======================================
// ⚙️ 定数 (CONSTANTS)
//======================================
const CONSTANTS = {
    // UI/アニメーション設定
    BGM_VOLUME: 0.1, 
    MOUTH_SPEED: 150, // 口パクの切り替え速度 (ms)
    TEXT_SPEED: 50,   // テキスト表示速度 (ms)
    LOADING_DURATION: 1500, // ローディング時間 (ms)

    // シーン名
    SCENE: {
        START: "start",
        INTRO: "intro",
        QUESTION: "question",
        LOADING: "loading",
        RESULT: "result",
    },

    // 画像ファイル名 (ダミー)
    IMAGE: {
        FACE_CLOSED: "img/face_main_close.png",
        FACE_OPEN: "img/face_main_open.png",
        WORK_PLACEHOLDER: "img/placeholder.png",
        VOLUME_ON: "img/volume_on.png",  // 音量ONアイコン
        VOLUME_OFF: "img/volume_off.png",// 音量OFFアイコン
    },
    // オーディオファイル名 (ダミー)
    AUDIO: {
        MAIN_BGM: "main",      // タイトル、イントロ、質問で使用
        RESULT_BGM: "result",  // 結果画面BGM
        START_VOICE: "audio/start-voice.wav",
        INTRO_VOICE: "audio/intro-voice.wav",
    }
};

//======================================
// 💾 グローバルステート (STATE)
//======================================
let STATE = {
    currentBGM: null,
    voice: {}, // 現在再生中の音声インスタンス
    textIntervalId: null,
    currentScene: CONSTANTS.SCENE.START,
    questionIndex: 0,
    answers: [], // 蓄積されたタグ
    
    // スライダー関連
    currentSlideIndex: 0,
    slideImages: [], // スライド画像のDOM要素配列
    currentMouthImage: null, // 口パクのターゲットDOM要素

    // 音量制御関連 (追加)
    isMuted: false, // ミュート状態を管理
};

//======================================
// 🎨 DOM要素のキャッシュ
//======================================
const DOM = {
    textEl: null,
    choicesEl: null,
    startBtn: null,
    
    slider: null,
    prevBtn: null,
    nextBtn: null,
    dotNav: null,
    
    loadingOverlay: null,
    progressContainer: null,
    progressBarFill: null,
    progressText: null,

    // 音量ボタン関連 (追加)
    volumeToggleBtn: null,
    volumeIcon: null,
};


//======================================
// 🎧 BGM・音声制御ユーティリティ
//======================================

/** BGMを再生する */
function playBGM(name) {
    if (STATE.currentBGM) {
        STATE.currentBGM.pause();
        STATE.currentBGM.currentTime = 0;
    }
    const bgm = new Audio(`audio/${name}.mp3`);
    bgm.loop = true;
    bgm.volume = STATE.isMuted ? 0 : CONSTANTS.BGM_VOLUME; // ミュート状態を反映
    // Play()の返り値はPromiseなので、エラー回避のためcatchを追加
    bgm.play().catch(() => console.warn(`[Audio] BGM再生がブロックされました: ${name}`));
    STATE.currentBGM = bgm;
}

/** 全ての音声と口パクアニメーションを停止し、口を閉じる */
function stopAllVoices() {
    Object.values(STATE.voice).forEach(v => {
        if (v && v.mouthIntervalId) {
            clearInterval(v.mouthIntervalId);
            v.mouthIntervalId = null;
        }
        if (v) {
            v.pause();
            v.currentTime = 0;
        }
    });
    STATE.voice = {}; // 音声インスタンスをクリア
    
    // 口を閉じる処理
    if (STATE.currentMouthImage && STATE.currentScene !== CONSTANTS.SCENE.RESULT) {
        STATE.currentMouthImage.src = CONSTANTS.IMAGE.FACE_CLOSED;
    }
}

/** 音声と口パクを同期再生する */
function playVoiceWithMouth(src, onEnd) {
    stopAllVoices();

    const newVoice = new Audio(src);
    newVoice.volume = STATE.isMuted ? 0 : 1; // 音声は通常ボリュームで、ミュート状態を反映
    newVoice.play().catch(() => console.warn(`[Audio] 音声再生がブロックされました: ${src}`));
    STATE.voice.current = newVoice; 

    let mouthOpen = false;
    const mouthInterval = setInterval(() => {
        mouthOpen = !mouthOpen;
        if (STATE.currentMouthImage && STATE.currentScene !== CONSTANTS.SCENE.RESULT) {
            STATE.currentMouthImage.src = mouthOpen ? CONSTANTS.IMAGE.FACE_OPEN : CONSTANTS.IMAGE.FACE_CLOSED;
        }
    }, CONSTANTS.MOUTH_SPEED);

    newVoice.mouthIntervalId = mouthInterval;

    newVoice.addEventListener("ended", () => {
        clearInterval(mouthInterval);
        if (STATE.currentMouthImage && STATE.currentScene !== CONSTANTS.SCENE.RESULT) {
            STATE.currentMouthImage.src = CONSTANTS.IMAGE.FACE_CLOSED;
        }
        if (onEnd) onEnd();
        delete STATE.voice.current;
    });
}

/** 全ての再生中の音のミュート状態を切り替える (音量ボタン機能) */
function toggleMuteAllSounds() {
    STATE.isMuted = !STATE.isMuted; // ミュート状態を反転
    console.log(`[Audio] Mute state toggled to: ${STATE.isMuted}`);

    // BGMの音量を調整
    if (STATE.currentBGM) {
        STATE.currentBGM.volume = STATE.isMuted ? 0 : CONSTANTS.BGM_VOLUME;
    }

    // 現在再生中の音声の音量を調整
    if (STATE.voice.current) {
        STATE.voice.current.volume = STATE.isMuted ? 0 : 1;
    }

    // アイコンの画像を切り替える
    if (DOM.volumeIcon) {
        DOM.volumeIcon.src = STATE.isMuted ? CONSTANTS.IMAGE.VOLUME_OFF : CONSTANTS.IMAGE.VOLUME_ON;
    }
}


//======================================
// 💬 テキスト表示ユーティリティ
//======================================

/** テキストを一文字ずつ表示する */
function animateText(text, callback) {
    if (STATE.textIntervalId) {
        clearInterval(STATE.textIntervalId);
        STATE.textIntervalId = null;
    }

    let i = 0;
    if (!DOM.textEl) return;
    DOM.textEl.innerHTML = ""; 

    // Markdownの太字(**)を<strong>タグに変換
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const interval = setInterval(() => {
        // 処理すべき生のテキストのみを抽出 (タグを考慮しない)
        const rawText = processedText.replace(/<[^>]*>?/gm, '');

        if (i < rawText.length) {
            // シンプルなテキストアニメーションとして、HTML全体を少しずつ表示
            DOM.textEl.textContent = rawText.substring(0, i + 1);
            i++;
        } else {
             // 完全に表示されたら、元のHTMLタグ付きのテキストをセット
            DOM.textEl.innerHTML = processedText;
            
            clearInterval(interval);
            STATE.textIntervalId = null;
            if (callback) callback();
        }
    }, CONSTANTS.TEXT_SPEED);

    STATE.textIntervalId = interval;
}


//======================================
// 🖼️ スライダー制御関数
//======================================

/** スライダーを特定のインデックスに移動させる */
function goToSlide(index) {
    if (STATE.slideImages.length === 0 || !DOM.slider) return;

    if (index < 0 || index >= STATE.slideImages.length) {
        return; 
    }
    
    STATE.currentSlideIndex = index;
    
    // スライダー全体の幅に対するオフセットを計算
    const offset = -STATE.currentSlideIndex * 100 / STATE.slideImages.length;
    DOM.slider.style.transform = `translateX(${offset}%)`;
    
    if (STATE.currentScene === CONSTANTS.SCENE.RESULT) {
        updateDots();
    }

    stopAllVoices(); 
}

/** ドットナビゲーションを更新する (結果画面用) */
function updateDots() {
    if (!DOM.dotNav || STATE.currentScene !== CONSTANTS.SCENE.RESULT) {
        return; 
    }
    
    // 1枚しかない場合はドットを非表示
    DOM.dotNav.style.display = STATE.slideImages.length > 1 ? 'flex' : 'none'; 
    DOM.dotNav.innerHTML = ''; 
    
    STATE.slideImages.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === STATE.currentSlideIndex ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        DOM.dotNav.appendChild(dot);
    });

    // ナビボタンの表示/非表示も更新
    const displayStyle = STATE.slideImages.length > 1 ? 'block' : 'none';
    if (DOM.prevBtn) DOM.prevBtn.style.display = displayStyle;
    if (DOM.nextBtn) DOM.nextBtn.style.display = displayStyle;
}

/** QA画面向けにスライダーを初期化（顔画像に戻す） */
function initializeQASlider() {
    if (!DOM.slider) return;
    
    DOM.slider.innerHTML = '';
    STATE.slideImages = [];
    
    const img = document.createElement('img');
    img.className = 'slide-image';
    img.src = CONSTANTS.IMAGE.FACE_CLOSED; 
    img.alt = "AIアシスタントの顔";

    DOM.slider.appendChild(img);
    STATE.slideImages.push(img);

    DOM.slider.style.width = '100%';
    img.style.width = '100%';
    DOM.slider.style.transform = 'translateX(0)';

    // QA画面ではナビゲーション非表示
    if (DOM.prevBtn) DOM.prevBtn.style.display = 'none';
    if (DOM.nextBtn) DOM.nextBtn.style.display = 'none';
    if (DOM.dotNav) {
        DOM.dotNav.style.display = 'none'; 
        DOM.dotNav.innerHTML = '';         
    }

    STATE.currentMouthImage = img; // 口パク対象を設定
    STATE.currentSlideIndex = 0;
    stopAllVoices(); 
}

/** 結果画面向けに作品画像をスライドに設定する */
function renderWorkSlider(work) {
    if (!DOM.slider) return;

    DOM.slider.innerHTML = '';
    STATE.slideImages = [];
    
    const imageUrls = work.images && Array.isArray(work.images) && work.images.length > 0
        ? work.images.map(imgName => `img/${imgName}`)
        : [CONSTANTS.IMAGE.WORK_PLACEHOLDER];

    imageUrls.forEach(url => {
        const img = document.createElement('img');
        img.className = 'slide-image';
        img.src = url;
        img.alt = work.title;
        DOM.slider.appendChild(img);
        STATE.slideImages.push(img);
    });

    const numImages = STATE.slideImages.length;

    // スライダーコンテナの幅を全画像分に設定
    DOM.slider.style.width = `${numImages * 100}%`;
    // 各画像の幅を1枚分に設定
    STATE.slideImages.forEach(img => {
        img.style.width = `${100 / numImages}%`;
    });
    
    STATE.currentMouthImage = null; // 結果画面では口パクしない

    goToSlide(0);
    updateDots(); // ドットとナビボタンの表示を更新
}


//======================================
// 📊 プログレスバー制御関数
//======================================

/** プログレスバーの表示を更新する */
function updateProgressBar() {
    if (!DOM.progressContainer || !DOM.progressBarFill || !DOM.progressText) return;

    if (STATE.currentScene === CONSTANTS.SCENE.QUESTION) {
        DOM.progressContainer.style.display = 'flex'; 
        
        const totalQuestions = questions.length;
        // 質問は0から始まるため、表示は+1
        const currentQuestionNumber = STATE.questionIndex; 
        
        const progress = (currentQuestionNumber / totalQuestions) * 100;
        
        DOM.progressText.textContent = `質問 ${currentQuestionNumber + 1} / ${totalQuestions} 問目`;
        
        DOM.progressBarFill.style.width = `${progress}%`;
        
    } else {
        DOM.progressContainer.style.display = 'none'; 
    }
}


//======================================
// ⚙️ ロジック関数
//======================================

/** 回答を処理し、次の質問へ進む */
function handleAnswer(choice) {
    // 選択されたタグを解答リストに追加
    STATE.answers.push(...choice.tags);

    stopAllVoices();
    STATE.questionIndex++;
    showQuestion(); 
}

/** 回答タグに基づいてスコアリング用のタグカウントオブジェクトを生成する */
function countTags() {
    return STATE.answers.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});
}

/** 最適な作品をマッチングして返す (タグスコア最大) */
function getBestMatchWork() {
    if (STATE.answers.length === 0) return works[0];
    const tagCounts = countTags();

    let bestMatch = null;
    let maxScore = -1;

    works.forEach(work => {
        let score = 0;
        work.tags.forEach(tag => {
            score += tagCounts[tag] || 0;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = work;
        } else if (score === maxScore && bestMatch === null) {
            bestMatch = work;
        }
    });

    return bestMatch || works[0];
}


//======================================
// 🖥️ シーン関数 
//======================================

/** スタート画面を表示する */
function showStartScreen() {
    STATE.currentScene = CONSTANTS.SCENE.START;
    playBGM(CONSTANTS.AUDIO.MAIN_BGM); 

    initializeQASlider(); 
    updateProgressBar(); 

    if (DOM.textEl) DOM.textEl.innerHTML = `このサイトは音が出ます`; // 初期メッセージを固定表示
    if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
    if (DOM.startBtn) DOM.startBtn.style.display = "block"; // 「はじめる」ボタンを表示
    if (DOM.volumeToggleBtn) DOM.volumeToggleBtn.classList.remove("hidden"); // 音量ボタンを表示

    STATE.answers = [];
    STATE.questionIndex = 0;
}

/** イントロシーンを表示する */
function showIntroScene() {
    STATE.currentScene = CONSTANTS.SCENE.INTRO;
    stopAllVoices();
    playBGM(CONSTANTS.AUDIO.MAIN_BGM); 
    updateProgressBar(); 
    initializeQASlider(); 

    const explanationText =
        "このサイトでは、3つの質問に答えることで、\nあなたにぴったりの作品を提案します。\n気軽に楽しんでくださいね。";

    // テキストアニメーションを開始し、完了後にボタンを表示
    animateText(explanationText, () => {
        if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
        const nextBtn = createChoiceButton("つぎへ", () => {
            stopAllVoices();
            STATE.questionIndex = 0; 
            showQuestion();
        });
        if (DOM.choicesEl) DOM.choicesEl.appendChild(nextBtn);
    });

    playVoiceWithMouth(CONSTANTS.AUDIO.INTRO_VOICE);

    if (DOM.startBtn) DOM.startBtn.style.display = "none"; 
}


/** 質問シーンを表示する */
function showQuestion() {
    STATE.currentScene = CONSTANTS.SCENE.QUESTION; 
    stopAllVoices();
    updateProgressBar(); 
    if (DOM.startBtn) DOM.startBtn.style.display = "none"; 

    if (STATE.questionIndex >= questions.length) {
        showLoading(); // 全ての質問に答えたらローディングへ
        return;
    }

    const q = questions[STATE.questionIndex];
    initializeQASlider(); 

    // テキストアニメーションを開始し、完了後に選択肢を表示
    animateText(q.text, () => {
        if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
        q.choices.forEach(choice => {
            const btn = createChoiceButton(choice.text, () => {
                handleAnswer(choice);
            });
            if (DOM.choicesEl) DOM.choicesEl.appendChild(btn);
        });
    });

    if (q.voice) {
        playVoiceWithMouth(q.voice);
    }
}

/** ローディング画面を表示する関数 */
function showLoading() {
    STATE.currentScene = CONSTANTS.SCENE.LOADING;
    stopAllVoices(); 
    updateProgressBar(); 

    if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
    if (DOM.textEl) DOM.textEl.textContent = ""; 

    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.remove('hidden');
    }
    // ローディング中は音量ボタンを非表示（UIをシンプルに保つため）
    if (DOM.volumeToggleBtn) DOM.volumeToggleBtn.classList.add("hidden"); 

    setTimeout(showResult, CONSTANTS.LOADING_DURATION);
}


/** 共通の結果表示部分をレンダリングする */
function renderResult(recommendedWork) {
    STATE.currentScene = CONSTANTS.SCENE.RESULT;
    
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.add('hidden');
    }
    updateProgressBar();
    if (DOM.volumeToggleBtn) DOM.volumeToggleBtn.classList.remove("hidden"); 

    const resultTitle = "【正常診断結果】";
        
    let resultText;
    if (recommendedWork) {
        renderWorkSlider(recommendedWork);
        
        resultText =
            `${resultTitle}\n` +
            `あなたにおすすめの作品は……\n` +
            `**『${recommendedWork.title}』**\n` +
            `（${recommendedWork.artist}作）\n\n` +
            `【作品紹介】\n` +
            `${recommendedWork.description}`;
    } else {
        resultText = `${resultTitle}\n残念ながらおすすめの作品が見つかりませんでした。`;
        initializeQASlider(); 
    }

    // テキストアニメーションを開始し、完了後にボタンを表示
    animateText(resultText, () => {
        if (DOM.choicesEl) DOM.choicesEl.innerHTML = "";
        STATE.answers = [];

        // 1. 再診断ボタン
        const restartBtn = createChoiceButton("もう一度診断する", () => {
            stopAllVoices();
            showIntroScene();
        });
        if (DOM.choicesEl) DOM.choicesEl.appendChild(restartBtn);

        // 2. AI再解析モードボタン (新サイトへ移動)
        const fakeBtn = createChoiceButton("AI再解析モード β版", () => {
            stopAllVoices();
            // 新しいエラーモードのサイトへ遷移
            // !! ここが修正点です !!
            window.location.href = "ai_error_mode.html"; 
        });
        if (DOM.choicesEl) DOM.choicesEl.appendChild(fakeBtn);
    });
}


/** 結果シーンを表示する (正常診断) */
function showResult() {
    stopAllVoices();
    playBGM(CONSTANTS.AUDIO.RESULT_BGM); 
    
    const recommendedWork = getBestMatchWork();
    renderResult(recommendedWork);
}


//======================================
// 🛠️ 補助関数
//======================================

/** 選択肢ボタンを作成するヘルパー関数 */
function createChoiceButton(text, onClick) {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
}

/** DOM要素をキャッシュする */
function cacheDOMElements() {
    DOM.textEl = document.getElementById("text");
    DOM.choicesEl = document.getElementById("choices");
    DOM.startBtn = document.getElementById("start-btn");
    
    DOM.slider = document.getElementById('image-slider');
    DOM.prevBtn = document.getElementById('prev-btn');
    DOM.nextBtn = document.getElementById('next-btn');
    DOM.dotNav = document.getElementById('dot-navigation');
    
    DOM.loadingOverlay = document.getElementById("loading-overlay"); 

    DOM.progressContainer = document.getElementById("progress-container");
    DOM.progressBarFill = document.getElementById("progress-bar-fill");
    DOM.progressText = document.getElementById("progress-text");

    // 音量ボタン関連 (追加)
    DOM.volumeToggleBtn = document.getElementById("volume-toggle");
    DOM.volumeIcon = document.getElementById("volume-icon");

    // 全ての要素が取得できたかチェック
    const requiredElements = [DOM.textEl, DOM.startBtn, DOM.choicesEl, DOM.slider, DOM.loadingOverlay, DOM.progressContainer, DOM.volumeToggleBtn, DOM.volumeIcon];
    if (requiredElements.some(el => el === null)) {
        console.error("[DOM] 必須DOM要素の取得に失敗しました。index.htmlのIDが正しいか確認してください。");
        return false;
    }
    return true;
}

/** イベントリスナーを設定する */
function setupEventListeners() {
    // スライダーナビゲーションのイベントリスナー
    if (DOM.prevBtn) DOM.prevBtn.onclick = () => goToSlide(STATE.currentSlideIndex - 1);
    if (DOM.nextBtn) DOM.nextBtn.onclick = () => goToSlide(STATE.currentSlideIndex + 1);

    // スタートボタンのイベントリスナー
    if (DOM.startBtn) {
        DOM.startBtn.onclick = () => {
            showIntroScene(); // イントロシーンに遷移
        };
    }
    
    // 音量トグルボタンのイベントリスナー
    if (DOM.volumeToggleBtn) {
        DOM.volumeToggleBtn.onclick = toggleMuteAllSounds;
    }
}


//======================================
// 🚀 初期化 (window.onload で実行)
//======================================
window.onload = () => {
    if (!cacheDOMElements()) return;
    setupEventListeners();

    // 初期状態としてスライダーをQAモードに設定
    initializeQASlider(); 
    updateProgressBar(); 

    // 初回はshowStartScreenを呼び出す
    showStartScreen();
};
