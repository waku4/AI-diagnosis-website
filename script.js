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
    PENALTY_RATE: 0.5, // 不一致ペナルティの割合 (最重要タグスコアの50%を減点)

    // シーン名
    SCENE: {
        START: "start",
        INTRO: "intro",
        QUESTION: "question",
        LOADING: "loading",
        RESULT: "result",
    },

    // 画像ファイル名 (ダミー) - ★修正1: img/ プレフィックスを削除
    IMAGE: {
        FACE_CLOSED: "face_main_close.png", // ファイル名のみ
        FACE_OPEN: "face_main_open.png",   // ファイル名のみ
        WORK_PLACEHOLDER: "placeholder.png", // ファイル名のみ
        VOLUME_ON: "volume_on.png",      // 音量ONアイコン
        VOLUME_OFF: "volume_off.png",    // 音量OFFアイコン
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
    answers: [], // 蓄積されたタグ (重み付き文字列のまま格納: 例 "vivid*3")
    
    // スライダー関連
    currentSlideIndex: 0,
    slideImages: [], // スライド画像のDOM要素配列
    currentMouthImage: null, // 口パクのターゲットDOM要素

    // 音量制御関連
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

    // 音量ボタン関連
    volumeToggleBtn: null,
    volumeIcon: null,
    
    gameContainer: null,
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
        // ★修正2: img/ プレフィックスを動的に付与
        STATE.currentMouthImage.src = `img/${CONSTANTS.IMAGE.FACE_CLOSED}`;
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
            // ★修正3: img/ プレフィックスを動的に付与
            STATE.currentMouthImage.src = mouthOpen 
                ? `img/${CONSTANTS.IMAGE.FACE_OPEN}` 
                : `img/${CONSTANTS.IMAGE.FACE_CLOSED}`;
        }
    }, CONSTANTS.MOUTH_SPEED);

    newVoice.mouthIntervalId = mouthInterval;

    newVoice.addEventListener("ended", () => {
        clearInterval(mouthInterval);
        if (STATE.currentMouthImage && STATE.currentScene !== CONSTANTS.SCENE.RESULT) {
            // ★修正4: img/ プレフィックスを動的に付与
            STATE.currentMouthImage.src = `img/${CONSTANTS.IMAGE.FACE_CLOSED}`;
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
        // ★修正5: img/ プレフィックスを動的に付与
        DOM.volumeIcon.src = STATE.isMuted 
            ? `img/${CONSTANTS.IMAGE.VOLUME_OFF}` 
            : `img/${CONSTANTS.IMAGE.VOLUME_ON}`;
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
    // ★修正6: img/ プレフィックスを動的に付与
    img.src = `img/${CONSTANTS.IMAGE.FACE_CLOSED}`; 
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
    
    // QAモードでは親要素の高さ制約を解除（CSS制御に戻す）
    const sliderWrapper = DOM.slider.parentElement;
    if (sliderWrapper) {
        sliderWrapper.style.height = 'auto'; 
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
        ? work.images.map(imgName => `img/${imgName}`) // ★既存のimg/付与ロジックは維持
        // ★修正7: プレースホルダー画像にも img/ プレフィックスを動的に付与
        : [`img/${CONSTANTS.IMAGE.WORK_PLACEHOLDER}`];

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
        
        // 質問数を1から始めるため、進捗計算を修正
        const progress = ((currentQuestionNumber) / totalQuestions) * 100;
        
        DOM.progressText.textContent = `質問 ${currentQuestionNumber + 1} / ${totalQuestions} 問目`;
        
        DOM.progressBarFill.style.width = `${progress}%`;
        
    } else {
        DOM.progressContainer.style.display = 'none'; 
    }
}


//======================================
// 🛠️ 補助関数 (タグ解析)
//======================================

/**
 * "tag*weight" 形式の文字列を解析し、[タグ名, 重み]のオブジェクトを返す
 * @param {string} tagString - 例: "vivid*3" または "calm"
 * @returns {{name: string, weight: number}}
 */
function parseTag(tagString) {
    const parts = tagString.split('*');
    const name = parts[0].trim();
    // 重みが指定されていなければ 1 とする
    const weight = parts.length > 1 ? parseInt(parts[1], 10) : 1;
    return { name, weight };
}


//======================================
// 📊 高度な診断ロジックの核となる関数
//======================================

/**
 * 1. ユーザーの全回答からタグごとの合計スコアを算出する (重み付け反映)
 * 2. 最もスコアが高いタグ（ペナルティ判定用）を抽出する (上位2つ)
 * @returns {{tagScores: Object<string, number>, maxTags: {name: string, score: number}[]}}
 */
function accumulateTags() {
    const tagScores = {};
    
    // スコア集計 (STATE.answersは重み付き文字列の配列)
    STATE.answers.forEach(tagStr => {
        const { name, weight } = parseTag(tagStr);
        tagScores[name] = (tagScores[name] || 0) + weight;
    });

    // 最大スコアのタグを特定 (ペナルティ判定に使用)
    const sortedTags = Object.entries(tagScores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);
        
    // スコア上位2つのタグを抽出
    const maxTags = sortedTags.slice(0, 2); 

    return { tagScores, maxTags };
}

/**
 * ユーザーのタグスコアに基づき、最適な作品を決定する
 * (一致度スコアと不一致ペナルティを適用)
 * @param {Object<string, number>} userTagScores - ユーザーのタグスコア集計
 * @param {{name: string, score: number}[]} maxTags - ユーザーの最重要タグリスト
 * @returns {Object|null} - 最もスコアの高い作品オブジェクト
 */
function calculateBestMatch(userTagScores, maxTags) {
    let bestMatch = null;
    // スコアは負の値になる可能性があるため、-Infinityで初期化
    let highestScore = -Infinity;
    
    const penaltyRate = CONSTANTS.PENALTY_RATE; 

    works.forEach(work => {
        let matchScore = 0;
        
        // 1. 一致度スコアの計算 (Positive Match)
        work.tags.forEach(workTag => {
            if (userTagScores[workTag]) {
                // 作品タグがユーザーのスコアにある場合、そのスコアを加算
                matchScore += userTagScores[workTag];
            }
        });

        // 2. 不一致ペナルティの計算 (Negative Penalty)
        maxTags.forEach(maxTag => {
            const isMatched = work.tags.includes(maxTag.name);
            
            if (!isMatched) {
                // 最重要タグが作品に含まれていない場合、ペナルティを適用
                // ペナルティ値は、その最重要タグのユーザーのスコアにレートを掛けたもの
                const penaltyValue = Math.ceil(maxTag.score * penaltyRate);
                matchScore -= penaltyValue;
                console.log(`[Penalty] 作品: ${work.title}, タグ: ${maxTag.name}が不足。${penaltyValue}点減点。`);
            }
        });
        
        console.log(`作品: ${work.title}, 最終スコア: ${matchScore}`);

        // スコア更新
        if (matchScore > highestScore) {
            highestScore = matchScore;
            bestMatch = work;
        } else if (matchScore === highestScore && bestMatch === null) {
            // 同点の場合、最初に現れた作品を採用
            bestMatch = work;
        }
    });

    return bestMatch;
}


//======================================
// ⚙️ ロジック関数
//======================================

/** 回答を処理し、次の質問へ進む */
function handleAnswer(choice) {
    // 選択されたタグを解答リストに追加 (重み付き文字列のまま)
    STATE.answers.push(...choice.tags);

    stopAllVoices();
    STATE.questionIndex++;
    showQuestion(); 
}

// **既存の getBestMatchWork は削除し、calculateBestMatch を直接使う**


//======================================
// 🖥️ シーン関数 
//======================================

/** スタート画面を表示する */
function showStartScreen() {
    STATE.currentScene = CONSTANTS.SCENE.START;
    playBGM(CONSTANTS.AUDIO.MAIN_BGM); 

    initializeQASlider(); 
    updateProgressBar(); 

    // 初期状態として音量アイコンをONに設定
    if (DOM.volumeIcon) {
        // ★修正8: img/ プレフィックスを動的に付与
        DOM.volumeIcon.src = STATE.isMuted 
            ? `img/${CONSTANTS.IMAGE.VOLUME_OFF}` 
            : `img/${CONSTANTS.IMAGE.VOLUME_ON}`;
    }
    
    // 画面切り替え時にクラスを削除
    if (DOM.gameContainer) {
        DOM.gameContainer.classList.remove('normal-result');
    }

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
    
    // イントロに戻る際にクラスを削除
    if (DOM.gameContainer) {
        DOM.gameContainer.classList.remove('normal-result');
    }

    const explanationText =
        "このサイトでは、5つの質問に答えることで、\nあなたにぴったりの作品を提案します。\n気軽に楽しんでくださいね。";

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
    
    // ローディング前（質問後）はクラスを削除しておく
    if (DOM.gameContainer) {
        DOM.gameContainer.classList.remove('normal-result');
    }


    setTimeout(showResult, CONSTANTS.LOADING_DURATION);
}


/** 結果シーンを表示する (正常診断) */
function showResult() {
    stopAllVoices();
    playBGM(CONSTANTS.AUDIO.RESULT_BGM); 

    // ★新しい高度な診断ロジックの適用★
    const { tagScores, maxTags } = accumulateTags();
    const recommendedWork = calculateBestMatch(tagScores, maxTags);
    
    console.log("--- 診断最終集計 ---");
    console.log("ユーザーの合計タグスコア:", tagScores);
    console.log("最重要タグ:", maxTags.map(t => `${t.name} (${t.score}点)`).join(", "));
    console.log("---------------------");
    console.log("★最終結果★:", recommendedWork ? recommendedWork.title : "見つかりませんでした");

    renderResult(recommendedWork);
}


/** 共通の結果表示部分をレンダリングする */
function renderResult(recommendedWork) {
    STATE.currentScene = CONSTANTS.SCENE.RESULT;
    
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.add('hidden');
    }
    updateProgressBar();
    if (DOM.volumeToggleBtn) DOM.volumeToggleBtn.classList.remove("hidden"); 

    const resultTitle = "【診断結果】";
        
    let resultText;
    if (recommendedWork) {
        // 正常診断の場合にクラスを追加
        if (DOM.gameContainer) {
            DOM.gameContainer.classList.add('normal-result');
        }

        renderWorkSlider(recommendedWork);
        
        // --- 画像表示強制修正: CSSで画像エリアが隠れる/高さが0になる問題の回避 ---
        const sliderWrapper = DOM.slider.parentElement;
        if (sliderWrapper) {
            // QAモードで設定されたかもしれない高さをリセットし、結果表示に適した固定の高さを設定
            sliderWrapper.style.height = '400px'; 
            sliderWrapper.style.overflow = 'hidden'; 
            // 念のためスライダー自体も視覚的にリセット
            DOM.slider.style.opacity = '1'; 
        }
        // --- 画像表示強制修正 終点 ---

        resultText =
            `${resultTitle}\n` +
            `あなたにおすすめの作品は……\n` +
            `**『${recommendedWork.title}』**\n` +
            `${recommendedWork.artist ? `（${recommendedWork.artist}作）` : ''}\n\n` +
            `【作品紹介】\n` +
            `${recommendedWork.description}`;
    } else {
        // 結果が見つからない（異常診断）の場合はクラスを削除
        if (DOM.gameContainer) {
            DOM.gameContainer.classList.remove('normal-result');
        }
        
        // QAモードに戻す際に高さ制約を解除 (initializeQASliderで実施済)
        
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
            showIntroScene(); // ここでクラスが削除される
        });
        if (DOM.choicesEl) DOM.choicesEl.appendChild(restartBtn);

        
        // 2. AI再解析モードボタン (新サイトへ移動)
        const fakeBtn = createChoiceButton("AI再解析モード β版", () => {
            stopAllVoices();
            window.location.href = "ai_error_mode.html"; 
        });
        if (DOM.choicesEl) DOM.choicesEl.appendChild(fakeBtn);
    });
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

    // 音量ボタン関連
    DOM.volumeToggleBtn = document.getElementById("volume-toggle");
    DOM.volumeIcon = document.getElementById("volume-icon");
    
    // gameContainerを取得
    DOM.gameContainer = document.getElementById("game-container");

    // 全ての要素が取得できたかチェック
    const requiredElements = [
        DOM.textEl, DOM.startBtn, DOM.choicesEl, DOM.slider, DOM.loadingOverlay, 
        DOM.progressContainer, DOM.volumeToggleBtn, DOM.volumeIcon, DOM.gameContainer
    ];
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