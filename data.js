//======================================
// 🧩 データ（質問・作品）
//======================================

export const questions = [
  {
    text: "今の気分は？",
    choices: [
      { text: "自然", tags: ["nature", "calm"] },
      { text: "テクノロジー", tags: ["tech", "vivid"] },
      { text: "感情", tags: ["emotion", "mystery"] }
    ],
    voice: "audio/question1-voice.wav"
  },
  {
    text: "興味のある言葉は？",
    choices: [
      { text: "自然", tags: ["nature", "calm"] },
      { text: "テクノロジー", tags: ["tech", "vivid"] },
      { text: "感情", tags: ["emotion", "mystery"] }
    ],
    voice: "audio/question1-voice.wav"
  },
  {
    text: "どんな色が好き？",
    choices: [
      { text: "青", tags: ["cool", "calm"] },
      { text: "赤", tags: ["warm", "vivid"] },
      { text: "白", tags: ["pure", "mystery"] }
    ],
    voice: "audio/question2-voice.wav"
  },
  {
    text: "どんな作品を見たい？",
    choices: [
      { text: "静かなもの", tags: ["calm", "slow"] },
      { text: "派手なもの", tags: ["vivid", "fast"] },
      { text: "不思議なもの", tags: ["mystery", "deep"] }
    ],
    voice: "audio/question3-voice.wav"
  }
];

export const works = [
  { 
    id: 1, 
    title: "風の詩", 
    artist: "A", 
    tags: ["nature", "calm", "cool", "slow"],
    description: "自然の静けさと、そこに流れる穏やかな時間の流れを表現した作品です。心を落ち着かせたい方へ。",
   
    images: ["work_1_main.png", "work_1_scene_a.png", "work_1_scene_b.png"], 
  },
  { 
    id: 2, 
    title: "未来都市の鼓動", 
    artist: "B", 
    tags: ["tech", "vivid", "fast"],
    description: "デジタル技術と光の饗宴。未来のエネルギーと躍動感を感じられる、視覚的に鮮やかな作品です。",
    image: "work_02.png" 
  },
  { 
    id: 3, 
    title: "深層心理", 
    artist: "C", 
    tags: ["emotion", "mystery", "deep", "pure"],
    description: "人間の内面、複雑で深い感情の層を、抽象的なイメージで表現しました。考えることが好きな方におすすめ。",
    image: "work_03.png" 
  },
  { 
    id: 4, 
    title: "青い光の記憶", 
    artist: "D", 
    tags: ["cool", "mystery", "emotion"],
    description: "失われた過去の記憶と、それを包み込むような静謐な青い光。懐かしさと共に切なさを覚えるでしょう。",
    image: "work_04.png" 
  },
  { 
    id: 5, 
    title: "爆発する情熱", 
    artist: "E", 
    tags: ["warm", "vivid", "fast"],
    description: "キャンバスから溢れ出すような強いエネルギーと色。抑えきれない情熱をテーマにしたダイナミックな作品です。",
    image: "work_05.png" 
  },
];
