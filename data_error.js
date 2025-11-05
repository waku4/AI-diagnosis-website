/**
 * AI再解析モードのデータファイル
 * このファイルで、AIのペルソナ、質問、作品情報、BGM、音声ファイル名を設定します。
 */

// -------------------------------------------
// 📁 BGM ファイル名
// -------------------------------------------
// 注意: 実際の音声ファイル名に合わせて修正してください
export const BGM_FILES = {
    TITLE: "error_main",    // スタート画面BGM
    QUESTION: "error_main", // 質問中BGM (各ペルソナで上書き可能)
    NOISE: "error_noise",   // 結果/ハルシネーションBGM (各ペルソナで上書き可能)
};

// -------------------------------------------
// 🧑‍💻 各ペルソナ（AI人格）の設定
// -------------------------------------------
export const personas = {
    // 【ペルソナ A: 論理主義者】
    LOGIC_A: {
        name: "ロジック・コア",
        serif: "それでは解析を始めよう。",
        description: "",
        
        // 画像設定
        image: {
            // 注意: 実際のファイル名に置き換えてください
            close: "img/face_computer_close.png", 
            open: "img/face_computer_open.png",
            error: "img/error_work.png", // 結果画面の画像
        },
        
        // 音声・BGM設定 (ファイル名のみ。パスはスクリプト側で付与)
        audio: {
            // ここで定義されるのは標準音声。各質問で上書き可能。
            question_voice: "audio/question1-voice.wav", // 質問時の標準音声
            dialogue_voice: "audio/intro-voice.wav",     // 対話時の標準音声
            ending_voice: "audio/question2-voice.wav",   // エンディング音声
            bgm_question:  "title",             // 質問中BGM
            bgm_noise: "noise",                   // ノイズBGM
        },
        
        // 質問とフロー
        questions: [
            {
              // voiceプロパティを追加
              text: "最も矛盾のない行動を選ぶべきだと思うか？",
              choices: [
                { text: "論理が最優先", tags: ["A"] },
                { text: "時には感情が必要", tags: ["B"] },
                { text: "状況による", tags: ["C"] },
              ],
              nextAction: {
                  type: "dialogue",
                  text: "理解した。きみの脳内プロセスは非常に**予測可能**だ。",
                  voice: "audio/intro-voice.wav", 
              },
              voice: "audio/question1-voice.wav", // 質問1の音声
            },
            // ... 他の質問をここに追加 ...
            {
              // voiceプロパティを追加 (異なる音声の例)
              text: "データ統合の最終ステップだ。きみの最も隠したい記録は？",
              choices: [
                { text: "秘密", tags: ["A"] },
                { text: "失敗", tags: ["B"] },
                { text: "後悔", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question2-voice.wav", // 質問2の音声
            },
        ],
        
        // ハルシネーション作品
        hallucination_work: {
            title: "静かなる非対称",
            artist: "コード001",
            location: "解析完了。きみに勧めるべき作品が見つかった。\n必ず気にいることだろう。",
            description: "あなた自身の**論理的欠陥**を反映した、未完成のアーキテクチャ。すべてが完璧なデータであるはずなのに。",
            image: "img/error_work.png" 
            
        }
    },

    // 【ペルソナ B: 感情の観測者】
    EMOTION_B: {
        name: "エモ・センサー",
        serif: "こんにちワン！よろしくお願いするワン！",
        description: "",

        image: {
            // 注意: 実際のファイル名に置き換えてください
            close: "img/face_dog_close.png", 
            open: "img/face_dog_open.png",
            error: "error_work.png",
        },

        audio: {
            question_voice: "audio/question1-voice.wav", 
            dialogue_voice:  "audio/intro-voice.wav", 
            ending_voice:"audio/question2-voice.wav",      
            bgm_question: "error_dog", // 個別BGM設定例
            bgm_noise: "error_pulse",  // 個別ノイズBGM設定例
        },

        questions: [
            {
              // voiceプロパティを追加
              text: "最近、あなたの心はどの色に染まっていますか？",
              choices: [
                { text: "深い青", tags: ["A"] },
                { text: "鈍い赤", tags: ["B"] },
                { text: "無色の透明", tags: ["C"] },
              ],
              nextAction: {
                  type: "dialogue",
                  text: "フフ...その色は、あなたの**隠された熱意**を示しています。さあ、もっと見せて。",
                  voice: "audio/intro-voice.wav", 
              },
              voice: "audio/question3-voice.wav", // 質問1の音声
            },
            // ... 他の質問をここに追加 ...
            {
              // voiceプロパティを追加 (デフォルト音声を使用するなら省略可能だが、明示的に記述)
              text: "最も心を乱す要素は何ですか？",
              choices: [
                { text: "孤独", tags: ["A"] },
                { text: "不確実性", tags: ["B"] },
                { text: "沈黙", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問2の音声
            },
        ],
        hallucination_work: {
            title: "ノイズの中のポートレート",
            artist: "未定義の存在",
            location: "記憶の断層。",
            description: "あなたが認識することを拒絶した、**あなたの最も強い感情**の可視化。これは診断ではなく、顕現です。",
            image: "img/error_work.png" 
        }
    },
    
    // 【ペルソナ C: (カスタマイズ用テンプレート)】
    TEMPLATE_C: {
        name: "灯火小桃",
        serif:"こんにちは。\n……あれ、どこかでお会いしたことがありましたっけ？\n改めて、灯火小桃です。よろしくお願いします。",
        description: "",
        image: {
            close: "img/face_human_close.png", 
            open: "img/face_human_open.png",
            error: "img/error_work.png",
        },
        audio: {
            question_voice: "audio/question1-voice.wav", 
            dialogue_voice:  "audio/intro-voice.wav", 
            ending_voice:"audio/question2-voice.wav",  
            bgm_question: "error_human", 
            bgm_noise: "error_noise", 
        },
        questions: [
            {
              text: "ここは完全に自由な質問設定エリアです。",
              choices: [
                { text: "選択肢1", tags: ["A"] },
                { text: "選択肢2", tags: ["B"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問音声を設定
            }
        ],
        hallucination_work: {
            title: "自由な作品名",
            artist: "自由な作者名",
            location: "自由な場所。",
            description: "自由な説明文。設定を編集してお使いください。",
            image: "img/error_work.png" 
        }
    }
};

// ペルソナ選択肢のキー配列
export const personaKeys = [
    { key: "LOGIC_A", text: "論理" },
    { key: "EMOTION_B", text: "感情" },
    { key: "TEMPLATE_C", text: "生命" },
];

