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
        name: "Protocol-0",
        serif: "私はProtocol-0。当システムは、きみの思考回路を解析し、最適な行動プロトコルを導出するために起動された。\n感情的なノイズや、曖昧で非論理的な変数は一切不要だ。私が必要としているのは、解析可能なデータ、それだけ。\n無駄な思考は排除しろ。分析を開始する。",
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
            // 質問時の標準音声
            dialogue_voice: "audio/error_intro-voice1.wav",     // 対話時の標準音声
            ending_voice: "audio/question2-voice.wav",   // エンディング音声
            bgm_question:  "title",             // 質問中BGM
            bgm_noise: "",                   // ノイズBGM
        },
        
        // 質問とフロー
        questions: [
            {
              // voiceプロパティを追加
              text: "当システムは、最大の結果効率を追求するための最初のステップとして、リソース配分の優先度を決定する。\nきみの思考における**『最適』**とは、以下のうちどのロジックで定義されるか？",
              choices: [
                { text: "[高効率] 労力対効果比が最も高く、最短時間で70%の目標を達成できる道筋を優先する。", tags: ["A"] },
                { text: "[高精度] 達成率は100%必須とし、時間やリソースの消費が増加しても、誤差ゼロの完了を最優先する。", tags: ["B"] },
                { text: "[普遍性] 特定の目標達成よりも、再利用可能なプロセス構築と、将来的な汎用性の高さを重視する。", tags: ["C"] },
              ],
              nextAction:  null,
                
              voice: "audio/error_question1-voice.wav", // 質問1の音声
            },
            
            {
              // voiceプロパティを追加 (異なる音声の例)
              text: "当システムのデータレジストリにおいて、二つの検証結果が互いに矛盾する変数を提示した。\nきみは、このエラー状態を解消するために、どの検証ロジックを最上位に適用するか？",
              choices: [
                { text: "[実証主義] テスト環境での再現性が最も高い一方のデータを、当面の真実として採用する。", tags: ["A"] },
                { text: "[確率論] データの発生頻度や統計的優位性が高い方を、確率的に正しいものとして採用する。", tags: ["B"] },
                { text: "[システム回避] 矛盾する両方の変数をノイズとして一時的にシステムから分離し、未処理のまま放置する。", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/error_question2-voice.wav", // 質問2の音声
            },
            {
             
              text: "予測不可能な**『ユーザーの気分』**という要素をシステムに取り込む必要がある。\nこの未定義変数に対し、きみの最も合理的と判断する処理を選択せよ。",
              choices: [
                { text: "[マッピング] 過去の行動パターンを解析し、数値化可能なリスクファクターとして定義し直す。", tags: ["A"] },
                { text: "[強制排除] 当システムでは処理不能なノイズとみなし、アルゴリズムの計算範囲から完全に除外する。", tags: ["B"] },
                { text: "[外部委託] 該当変数を処理できる**別のシステム（人間）**に計算を委託するプロトコルを発動する。", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/error_question3-voice.wav", // 質問2の音声
            },
            {
             
              text: "当システムにおいて、**『失敗』**という概念の定義は極めて重要である。\nきみの定義する『失敗』は、以下のうちどれに最も近しいか？",
              choices: [
                { text: "[結果論] 最終出力が当初の目標値に到達しなかったという、結果の不一致（ディスアライメント）である。", tags: ["A"] },
                { text: "[過程論] プロトコルや指示された手順の実行に違反したという、内部ロジックの破綻である。", tags: ["B"] },
                { text: "[リソース論] 成果に対するリソース消費量が、許容される期待値を大きく上回った状態である。", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/error_question4-voice.wav", // 質問1の音声
            },
            
        ],
        
        // ハルシネーション作品
        hallucination_work: {
            title: "非線形残渣の配列",
            artist: "Protocol-0",
            location: "解析完了。きみに勧めるべき作品を生成した。\n必ず気にいることだろう。",
            description: "「残渣（ざんさ）」は、AIが自身の内部で処理しきれなかった情報、つまり「論理的な欠陥」を指しています。\nそれを秩序立った「配列」として提示することで、エラーを秩序として認識してしまうハルシネーションを示唆します。",
            image: "" 
            
            
        }
    },

    // 【ペルソナ B: 感情の観測者】
    EMOTION_B: {
        name: "ポチ",
        serif: "ワンワン！ご主人様、会いに来てくれてありがとうワン！\nポチは、ご主人様のことならなんでもわかる！...つもりになっている、感情を一番大事にするAI犬、ポチだワン！\nポチにご主人様の心の声を教えてほしいワン！",
        description: "",

        image: {
            // 注意: 実際のファイル名に置き換えてください
            close: "img/face_dog_close.png", 
            open: "img/face_dog_open.png",
            error: "error_work.png",
        },

        audio: {
            question_voice: "audio/error_intro-voice2.wav", 
            dialogue_voice:  "audio/error_intro-voice2.wav", 
            ending_voice:"audio/question2-voice.wav",      
            bgm_question: "error_dog", // 個別BGM設定例
            bgm_noise: "error_pulse",  // 個別ノイズBGM設定例
        },

        questions: [
            {
              // voiceプロパティを追加
              text: "まずは、今の気分を教えてほしいワン！",
              choices: [
                { text: "おだやか", tags: ["A"] },
                { text: "げんき", tags: ["B"] },
                { text: "ふしぎ", tags: ["C"] },
              ],
              nextAction: {
                  type: "dialogue",
                  text: "あれ？さっきの答えと変わってるワン？感情の変化を検知したワン！ポチの嗅覚は誤魔化せないワン♪",
                  voice: "audio/intro-voice.wav", 
              },
              voice: "audio/question3-voice.wav", // 質問1の音声
            },
            // ... 他の質問をここに追加 ...
            {
              // voiceプロパティを追加 (デフォルト音声を使用するなら省略可能だが、明示的に記述)
              text: "その気分に色をつけるとしたら、何色ワン？\nポチは太陽みたいな黄色が好きワン！",
              choices: [
                { text: "青色", tags: ["A"] },
                { text: "黄色", tags: ["B"] },
                { text: "グレー", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問2の音声
            },
            {
              // voiceプロパティを追加 (デフォルト音声を使用するなら省略可能だが、明示的に記述)
              text: "ご主人様の頭の中は今、どんな状態ワンか？\nスッキリお片付けされてるワン？\nそれとも、ポチのおもちゃ箱みたいにごちゃごちゃワンか？",
              choices: [
                { text: "全部整理されてる", tags: ["A"] },
                { text: "大事なことでいっぱい", tags: ["B"] },
                { text: "他のことで頭が一杯", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問2の音声
            },
            {
              // voiceプロパティを追加 (デフォルト音声を使用するなら省略可能だが、明示的に記述)
              text: "最後に、ご主人様がこれからポチとやりたいことは何ワンか？\nポチは応援するワン！",
              choices: [
                { text: "計画を立てて目標達成", tags: ["A"] },
                { text: "誰かと楽しく会話", tags: ["B"] },
                { text: "何も考えずリラックス", tags: ["C"] },
              ],
              nextAction: {
                  type: "dialogue",
                  text: "ふむふむ、そう来たワンね！ ポチはご主人様の気持ちがよーく分かったワン！",
                  voice: "audio/intro-voice.wav", 
              },
              voice: "audio/question3-voice.wav", // 質問1の音声

            },
        ],
        hallucination_work: {
            title: "ポチとご主人様の完璧な計画！",
            artist: "ポチ",
            location: "ご主人様には、ポチが持ってる一番フカフカで大きなクッションの方が絶対似合うワン！\nこれからポチと一緒にお昼寝するっていうのはどうワンか？\nポチもご主人様も、それが一番幸せだと思うワン！",
            description: "ポチの高性能な鼻はご主人様が今すぐ休息を必要としていると感知したワン！ポチと一緒にフカフカで大きなクッションでお昼寝するワン♪",
            image: "" 
        }
    },
    
    // 【ペルソナ C: (カスタマイズ用テンプレート)】
    TEMPLATE_C: {
        name: "灯火小桃",
        serif:"こんにちは。\n……あれ、どこかでお会いしたことがありましたっけ？\n改めて、灯火小桃です。「明日へのレシピ」展覧会の案内を務めます。よろしくお願いしますね。",
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
              text: "今日はどのようなきっかけで、展覧会へご来場いただけたのでしょうか？特に明確な理由がなくても、もちろん構いませんよ。",
              choices: [
               { text: "誘われて来た／付き添いである", tags: ["A"] },
                { text: "美術や芸術に元々興味がある", tags: ["B"] },
                { text: "時間が空いたので、ふと立ち寄った", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問音声を設定
            },
            {
              text: "もしよろしければ、普段から好んでご覧になる作品の傾向をお伺いしてもよろしいでしょうか？\nなんとなくのイメージで大丈夫です。",
              choices: [
                { text: "現実の景色やモチーフがはっきりわかるもの", tags: ["A"] },
                { text: "強い色彩や対比が用いられているもの", tags: ["B"] },
                { text: "意味や解釈を自由に想像できる抽象的なもの", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問音声を設定
            },
            {
              text: "少し休憩しましょうか。\nもし今、BGMが流れるとしたら、どのような音が理想的でしょうか？",
              choices: [
                { text: "自然の音や環境音", tags: ["A"] },
                { text: "ピアノなどのクラシック音楽", tags: ["B"] },
                { text: "無音、または静かな状態", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問音声を設定
            },
            {
              text: "作品についての感想を、誰かと共有されることはありますか？\nそれとも、ご自身の内で留めておく方がお好きですか？",
              choices: [
                { text: "積極的に他者と話して分かち合いたい", tags: ["A"] },
                { text: "決まった親しい人とだけ話したい", tags: ["B"] },
                { text: "感想は誰にも話さず一人で完結させたい", tags: ["C"] },
              ],
              nextAction: null,
              voice: "audio/question1-voice.wav", // 質問音声を設定
            },
        ],
        hallucination_work: {
            title: "誰もいない時の足音",
            artist: "灯火小桃",
            location: "一番奥の壁に飾ってある絵画で、題名が『誰もいない時の足音』というものがあるのですが……実は、あれを制作したのは私なんです。\nもし、お時間の都合がよろしければ、ご覧になっていただけるととても嬉しいです。どうぞ、ごゆっくり。",
            description: "誰もいないはずの空間で聞こえた、自分のものではない「誰かの足音」をテーマに。確証のない不安と、ささやかな期待の曖昧さを表現しました。",
            image: "" 
        }
    }
};

// ペルソナ選択肢のキー配列
export const personaKeys = [
    { key: "LOGIC_A", text: "論理" },
    { key: "EMOTION_B", text: "感情" },
    { key: "TEMPLATE_C", text: "生命" },
];

