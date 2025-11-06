//======================================
// 🧩 データ（質問・作品）
//======================================

export const questions = [
  // Q1 (必須): 今の気分は？ (エネルギー/トーン)
  {
    text: "今の気分は？最も近いものを選んでください。",
    choices: [
      // 穏やかな気分は「calm」と「slow」の重みを高く
      { text: "穏やかで静かな気分", tags: ["calm*3", "nature*2", "slow*3"] },
      // 活発な気分は「vivid」と「fast」の重みを高く
      { text: "エネルギッシュで活発な気分", tags: ["vivid*3", "tech*2", "fast*3"] },
      // 不思議な気分は「mystery」と「deep」の重みを高く
      { text: "何か不思議なものに触れたい気分", tags: ["mystery*3", "deep"] }
    ],
    voice: "audio/question1-voice.wav"
  },
  
  // Q2: どちらの環境に惹かれますか？ (テーマ/内容)
  {
    text: "どの環境に最も強く惹かれますか？",
    choices: [
      // 自然は「nature」を特に重視
      { text: "緑豊かな森や水辺", tags: ["nature*3", "calm", "slow"] },
      // 技術は「tech」を特に重視
      { text: "複雑な配線と未来の都市", tags: ["tech*3", "vivid", "fast"] },
      // 未知は「mystery」を特に重視
      { text: "誰も知らない海底や宇宙", tags: ["mystery*3", "deep"] }
    ],
    voice: "audio/question2-voice.wav"
  },
  
  // Q3: 好きな色彩の方向性は？ (視覚/構成)
  {
    text: "好きな色彩は？",
    choices: [
      // 冷たい色合いは「cool」「direct」に関連付け
      { text: "知的で冷たい色合い（青、シルバー）", tags: ["cool*2", "direct*2", "calm"] },
      // 温かい色合いは「warm」「vivid」に関連付け
      { text: "情熱的で温かい色合い（赤、オレンジ）", tags: ["warm*2", "vivid*2", "fast"] },
      // 中間色は「mystery」に関連付け
      { text: "光を放つ曖昧な中間色（紫、エメラルド）", tags: ["mystery*2", "pure"] }
    ],
    voice: "audio/question3-voice.wav"
  },
  
  // Q4: 作品を見る際、何を最も重視しますか？ (体験・動機)
  {
    text: "作品を見る際、何を最も重視しますか？",
    choices: [
      // メッセージの明確さは「direct」を重視
      { text: "表現が明確でメッセージがストレートなもの", tags: ["direct*3", "tech"] },
      // 解釈の余地は「mystery」を重視
      { text: "解釈の余地があり、隠された意味を持つもの", tags: ["mystery*3", "deep", "nature"] },
      // 落ち着きは「calm」と「slow」を重視
      { text: "シンプルで心を落ち着かせる構図", tags: ["calm*2", "pure", "slow"] }
    ],
    voice: "audio/question4-voice.wav"
  },

  // Q5: 理想とする時間の流れは？ (時間軸/リズム)
  {
    text: "理想とする時間の流れは？",
    choices: [
      // ゆっくりは「slow」と「calm」を重視
      { text: "ゆっくりと流れ、細部を味わえる時間", tags: ["slow*3", "calm*2", "nature"] },
      // 速い時間は「fast」と「vivid」を重視
      { text: "刺激的で、一瞬一瞬が新しい速い時間", tags: ["fast*3", "vivid*2", "tech"] },
      // 無重力な感覚は「mystery」と「deep」を重視
      { text: "時間の概念が曖昧になるような無重力な感覚", tags: ["mystery*2", "deep"] }
    ],
    voice: "audio/question5-voice.wav"
  }
];

export const works = [
  { 
    id: 1, 
    title: "OKURINA", 
    artist: "兼田夕璃", 
    tags: ["vivid", "nature", "pure", "fast"],
    description: "解体から再生へ。名を与え個性を纏わせることで、日常のビーズに命と自己肯定感を吹き込むアニミズム×ギャル精神の作品。",
   
    images: ["work_1_main.png", "work_1_scene_a.png", "work_1_scene_b.png"], 
  },
  { 
    id: 2, 
    title: "痕を受け入れる", 
    artist: "小笠原礼瑠", 
    tags: ["vivid", "nature", "direct","fast"],
    description: "リストカットとタトゥーをテーマにした作品です。偏見の目で見られる事象を立体物と映像で表現しました。",
    image: ["work_2_main.png", "work_2_scene_a.png", "work_2_scene_b.png"], 
  },
  { 
    id: 3, 
    title: "イノリ", 
    artist: "佐藤里菜", 
    tags: ["calm", "tech", "deep", "slow"],
    description: "祈りは、対象の有無に依存しない。\n祈る行為そのものが、自己と世界のつながりを確認するための装置だと考えている。\n神棚という既存の祈りの器を再構築することで、「誰が決めたか分からない形式に従う祈り」から、「自ら選び取る祈り」への転換を提示する。\nこれは信仰の否定ではなく、信じるとはどういうことかを、もう一度私たちに問いかける行為である。",
    image:  ["work_3_main.png", "work_3_scene_a.png", "work_3_scene_b.png"], 
  },
  { 
    id: 4, 
    title: "止まった時間と流れる時間", 
    artist: "佐藤咲", 
    tags: ["calm", "nature", "deep","slow"],
    description: "都会のきらびやかさに憧れつつ、田舎の静けさと温もりの美しさを大切に思う心がある私でありいつも揺れる。",
    image:  ["work_4_main.png", "work_4_scene_a.png", "work_4_scene_b.png"],  
  },
  { 
    id: 5, 
    title: "あいをかんじて", 
    artist: "よしださき", 
    tags: ["calm", "nature","direct","slow"],
    description: "愛玩動物を愛でる人間とその先にある責任、全てに向き合う覚悟を作品に落とし込みました。",
    image: ["work_5_main.png", "work_5_scene_a.png", "work_5_scene_b.png"], 
  },
   { 
    id: 6, 
    title: "我々が生まれてきたことは間違いだったのか", 
    artist: "黒坂百花", 
    tags: ["vivid","nature","deep","slow"],
    description: "この世界の問題は、全て人間が生まれてきたことから始まっている。生まれてこなければあらゆる苦しみ、悲しみ、憎しみは存在しない。我々が生まれてきたことは間違いだったのか。\n産むべきか、産まざるべきか。\n産みたいか、産みたくないか。\n生まれたいか、生まれたくないか。\nしかし、我々は既に生まれてきてしまった。それならこの世界の全てを喰らい、歌い、踊って、この身が朽ちるまで楽しく生きようではないか。",
    image: ["work_6_main.png", "work_6_scene_a.png", "work_6_scene_b.png"], 
  },
  { 
    id: 7, 
    title: "dull", 
    artist: "阿部文香", 
    tags: ["calm","tech","mystery","slow"],
    description: "鈍感になって便利さを享受することが多い。\n置き配されるUberEatsやAmazon\nテクノロジーが発達しても、依然として多くのサービスの出来は労働者のモラルに委ねられている事実を忘れかけている、忘れたことにしていた。\n満員電車　人混み　ぎゅうぎゅうに詰め込まれたそこで、\n本来人が立ち入れば拒絶するであろう距離感で\n今日も忙しなく社会が運営されてゆく。\n目を凝らすとそこにはいくつもの人生が連なっていて\n一つ一つの重みを感じながら生きていたらまにあわない、割に合わない。\nだから見ない。見ないふりをうまく会得すれば生きやすい。\nわざと鈍感になることで、わざとピントを合わせず物事を見ることで\n根底にあるかもしれない問題から目を逸らし続けている。\n見るべきもの、拾い上げるべき情報、問題はどこにあるのだろうか。\n社会に臨する時、鈍感であることに忸怩たる思いで生活する。\n",
    image: ["work_7_main.png", "work_7_scene_a.png", "work_7_scene_b.png"], 
  },
  { 
    id: 8, 
    title: "触れえぬもののかたち", 
    artist: "沼田歩", 
    tags: ["calm", "tech","pure","slow"],
    description: "身近な人が病を抱え、あるいは病によって亡くなる経験を重ねるなかで、\n私は、やるせなさや現実から逃れたいという思いを抱くことがあった。\nそうした経験を通して、「大切なものとどう向き合うか」という、\n誰にでも起こりうる感覚と状況を視覚芸術としてかたちにすることを試みた。\n人は日常の中で、身近な誰かの病や死に静かに晒されながら生きている。\n病という、手の届かない〈他者の身体〉へと視線を向けたとき、\n私たちはしばしば情や恐れ、身体的拒絶などを理由に、反射的に目を背けてしまう。\n本作は、その「大切なものから目を逸らす人間の在りよう」を、\n大きい・丸・白・黒のシンプルな構成によって可視化し、“鑑賞できない鑑賞作品”として提示する試みである。\n制作の過程で、作品に大きな穴が開き、形を維持できずに萎んでいく姿を前に、\n私は「向き合いたくても向き合えない」という現実を突きつけられた。vやり取りや共存、そして時間の流れのなかで愛が生まれ、\nやがてそれが自らの手には負えなくなったとき——\n人は何を思い、どのようにその存在と向き合うのだろうか。\n本作は、その問いを静かに投げかけている。\n",
    image:  ["work_8_main.png", "work_8_scene_a.png", "work_8_scene_b.png"], 
  },
];
