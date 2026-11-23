const SLIDES_BY_LESSON = {
  // LESSON 1: Greetings & Introductions (7 slides)
  1: [
    {
      id: "1-1",
      type: "intro",
      title: "Lesson Introduction"
    },
    {
      id: "1-2",
      type: "vocabulary",
      title: "Common Greetings",
      subtitle: "Learn polite ways to greet people at different times of the day.",
      items: [
        { emoji: "👋", word: "Hello / Hi", example: "Hello! Nice to meet you." },
        { emoji: "🌅", word: "Good morning", example: "Good morning, Sarah!" },
        { emoji: "☀️", word: "Good afternoon", example: "Good afternoon, teacher." },
        { emoji: "🌙", word: "Good evening", example: "Good evening, everyone." },
        { emoji: "🤝", word: "Nice to meet you", example: "Hi, I'm Tom. Nice to meet you!" },
        { emoji: "👋", word: "Goodbye / Bye", example: "Goodbye! See you tomorrow." }
      ]
    },
    {
      id: "1-3",
      type: "dialogue",
      title: "Asking 'How are you?'",
      subtitle: "Listen to a natural greeting between two classmates.",
      lines: [
        { speaker: "Emma", text: "Good morning, Liam! How are you?" },
        { speaker: "Liam", text: "Hi Emma! I'm fine, thank you. And you?" },
        { speaker: "Emma", text: "I'm very good, thanks! Are you ready for class?" },
        { speaker: "Liam", text: "Yes, I am! Let's go inside." }
      ]
    },
    {
      id: "1-4",
      type: "grammar",
      title: "Introducing Yourself",
      subtitle: "Use these simple patterns to share your name, age, and country.",
      headers: ["Question", "Answer Pattern", "Example"],
      rows: [
        ["What's your name?", "My name is... / I'm...", "My name is Sofia. / I'm Sofia."],
        ["How old are you?", "I am [number] years old.", "I am 20 years old."],
        ["Where are you from?", "I am from [country].", "I am from Morocco."],
        ["How are you?", "I'm fine / good, thank you.", "I'm good, thank you!"]
      ],
      tip: "In everyday conversation, 'I'm' is the short form of 'I am'."
    },
    {
      id: "1-5",
      type: "activity",
      activityType: "listening",
      title: "Listening Practice: Greetings",
      instruction: "Click 'Listen' on each question and choose the best response.",
      questions: [
        {
          prompt: "Listen and choose the correct reply:",
          audioText: "Good morning! How are you today?",
          options: ["I'm fine, thank you!", "I am from Spain.", "My name is Alex."],
          answer: 0
        },
        {
          prompt: "Listen and choose the correct reply:",
          audioText: "Hello! What is your name?",
          options: ["Good night!", "My name is Sara.", "I am 19 years old."],
          answer: 1
        },
        {
          prompt: "Listen and choose the correct reply:",
          audioText: "Where are you from?",
          options: ["Nice to meet you too.", "I'm very well, thanks.", "I am from Canada."],
          answer: 2
        }
      ]
    },
    {
      id: "1-6",
      type: "activity",
      activityType: "matching",
      title: "Match Questions & Answers",
      instruction: "Click each question, choose its matching answer, then check all pairs.",
      pairs: [
        { left: "What's your name?", right: "I'm Daniel." },
        { left: "How are you?", right: "I'm good, thanks!" },
        { left: "Where are you from?", right: "I'm from Brazil." },
        { left: "Nice to meet you.", right: "Nice to meet you too." }
      ]
    },
    {
      id: "1-7",
      type: "completion",
      title: "Lesson Completed",
      message: "You can now greet people politely and introduce yourself in English!"
    }
  ],

  // LESSON 2: Family (8 slides)
  2: [
    {
      id: "2-1",
      type: "intro",
      title: "Lesson Introduction"
    },
    {
      id: "2-2",
      type: "imageDialogue",
      title: "My Family Tree",
      subtitle: "Look at the family tree, listen, and read the explanation.",
      imageUrl: "../assets/images/lesson2-family-tree.png.png",
      lines: [
        { speaker: "Friend", text: "Who is in your family tree?" },
        { speaker: "Adam", text: "At the top are my grandfather and grandmother (my grandparents)." },
        { speaker: "Adam", text: "Here are my parents: my mother and my father. I also have an uncle and an aunt." },
        { speaker: "Adam", text: "And down here are my brother, my sister, and me!" }
      ]
    },
  
    {
      id: "2-3",
      type: "grammar",
      title: "Talking About Your Family",
      subtitle: "Use 'This is my...' and 'I have...' to introduce family members.",
      headers: ["Structure", "Use", "Example"],
      rows: [
        ["This is my + [person]", "Introduce one person", "This is my brother, Adam."],
        ["These are my + [plural]", "Introduce two or more", "These are my parents."],
        ["I have + [number] + [family]", "Say how many relatives", "I have two sisters."],
        ["He / She is + [age/job]", "Give extra details", "She is a doctor."]
      ],
      tip: "Use 'he' for male family members (father, brother, uncle) and 'she' for female family members (mother, sister, aunt)."
    },
    {
      id: "2-4",
      type: "video",
      title: "Looking at a Family Photo",
      subtitle: "Watch Noah and Maya talking about Maya's family photo.",
      videoUrl: "../assets/videos/lesson2-family.mp4.mp4",
      lines: [
        { speaker: "Noah", text: "Who is this in the photo, Maya?" },
        { speaker: "Maya", text: "This is my mother, and this is my father. I have one brother and one sister." }
      ]
    },
    {
      id: "2-5",
      type: "activity",
      activityType: "mcq",
      title: "Family Vocabulary Quiz",
      instruction: "Choose the correct family word for each sentence.",
      questions: [
        {
          prompt: "My mother's mother is my __________.",
          options: ["aunt", "grandmother", "sister"],
          answer: 1
        },
        {
          prompt: "My father's brother is my __________.",
          options: ["uncle", "grandfather", "brother"],
          answer: 0
        },
        {
          prompt: "My mother and father are my __________.",
          options: ["sisters", "uncles", "parents"],
          answer: 2
        }
      ]
    },
    {
      id: "2-6",
      type: "activity",
      activityType: "sentenceBuilder",
      title: "Build Family Sentences",
      instruction: "Click the words in the correct order to make sentences.",
      sentences: [
        {
          hint: "Introduce your sister",
          words: ["is", "This", "sister.", "my"],
          target: "This is my sister."
        },
        {
          hint: "Say you have two brothers",
          words: ["brothers.", "have", "two", "I"],
          target: "I have two brothers."
        }
      ]
    },
    {
      id: "2-7",
      type: "completion",
      title: "Lesson Completed",
      message: "Awesome work! You now know key English family vocabulary and sentence patterns."
    }
  ],

  // LESSON 3: Home & Daily Life (9 slides)
  3: [
    {
      id: "3-1",
      type: "intro",
      title: "Lesson Introduction"
    },
{
    id: "3-2",
    type: "imageDialogue",
    title: "Welcome to My House!",
    subtitle: "Listen to Adam showing his house, rooms, and objects to Sara.",
    imageUrl: "../assets/images/lesson3-house-tree.png.png",
    lines: [
      { speaker: "Sara", text: "Your house is very nice, Adam! What are the rooms?" },
      { speaker: "Adam", text: "Thanks! Here is the living room with a sofa and a TV, and next to it is the kitchen with a table." },
      { speaker: "Sara", text: "Where is your bedroom?" },
      { speaker: "Adam", text: "My bedroom is upstairs. It has a comfortable bed and a lamp. Next to it is the bathroom, and outside we have a small garden with flowers!" }
    ]
  },
    {
    id: "3-3",
    type: "imageDialogue",
    title: "My Daily Routine",
    subtitle: "Listen to Adam talking about what he does every day.",
    imageUrl: "../assets/images/lesson3-routine-tree.png.png",
    lines: [
      { speaker: "Sara", text: "What is your daily routine, Adam?" },
      { speaker: "Adam", text: "In the morning, I wake up at 7 o'clock and wash my face in the bathroom,Then, I eat breakfast in the kitchen and go to school" },
      { speaker: "Sara", text: "What do you do in the evening?" },
      { speaker: "Adam", text: "In the evening, I do my homework, watch TV in the living room, and go to sleep at 10 o'clock!" }
    ]
  },
   
    {
      id: "3-4",
      type: "grammar",
      title: "Basic Time Expressions",
      subtitle: "Use 'at' for clock times and 'in the' for parts of the day.",
      headers: ["Preposition", "Time Expression", "Example Sentence"],
      rows: [
        ["at", "at 7 o'clock / at 8:30", "I wake up at 7 o'clock."],
        ["in the", "in the morning", "I drink coffee in the morning."],
        ["in the", "in the afternoon", "We study in the afternoon."],
        ["in the", "in the evening", "They eat dinner in the evening."],
        ["at", "at night", "I sleep at night."]
      ],
      tip: "Remember: We say 'in the morning', 'in the afternoon', 'in the evening', but 'at night'!"
    },
    {
      id: "3-5",
      type: "imageDialogue",
      title: "My Daily Routine",
      subtitle: "Listen to Samandra describe her typical weekday.",
      imageUrl: "../assets/images/lesson3-samandra-routine.png.png",
      lines: [
        { speaker: "Samandra", text: "I wake up at 7 o'clock in the morning." },
        { speaker: "Samandra", text: "I eat breakfast in the kitchen at 7:30." },
        { speaker: "Samandra", text: "In the afternoon, I do my homework in my bedroom." },
        { speaker: "Samandra", text: "At night, I watch TV in the living room and go to bed at 10." }
      ]
    },
    {
      id: "3-6",
      type: "activity",
      activityType: "matching",
      title: "Match Rooms & Actions",
      instruction: "Match each home room with what people usually do there.",
      pairs: [
        { left: "Kitchen", right: "Cook dinner" },
        { left: "Bedroom", right: "Sleep at night" },
        { left: "Bathroom", right: "Take a shower" },
        { left: "Living room", right: "Watch TV on the sofa" }
      ]
    },
    {
      id: "3-7",
      type: "activity",
      activityType: "fillBlank",
      title: "Complete the Daily Routine",
      instruction: "Choose the correct word to complete each sentence.",
      items: [
        {
          before: "I wake up",
          options: ["at", "in", "on"],
          after: "7 o'clock.",
          answer: "at"
        },
        {
          before: "She eats breakfast",
          options: ["at", "in the", "on the"],
          after: "morning.",
          answer: "in the"
        },
        {
          before: "We cook food in the",
          options: ["bedroom", "bathroom", "kitchen"],
          after: ".",
          answer: "kitchen"
        }
      ]
    },
    {
      id: "3-8",
      type: "completion",
      title: "Lesson Completed",
      message: "Great job! You can now describe your home and daily routine in English."
    }
  ],

  // LESSON 4: Clothes (8 slides)
  4: [
    {
      id: "4-1",
      type: "intro",
      title: "Lesson Introduction"
    },
  {
      id: "4-2",
      type: "imageDialogue",
      title: "At the Clothing Store",
      subtitle: "Look at the clothes in the shop, listen, and read the conversation.",
      imageUrl: "../assets/images/lesson4-clothes-store.png.png",
      lines: [
        { speaker: "Samandra", text: "Look at this store! There are so many nice clothes." },
        { speaker: "Adam", text: "Yes! On the rack, I see a T-shirt, a blue shirt, a warm sweater, a jacket, and a green dress." },
        { speaker: "Samandra", text: "And down here, there are jeans, a skirt, sneakers, shoes, and a hat!" },
        { speaker: "Adam", text: "Let's buy a jacket and new sneakers!" }
      ]
    },
   
    {
      id: "4-3",
      type: "grammar",
      title: "Colors + Clothes & 'Wearing'",
      subtitle: "In English, the color comes BEFORE the clothing word.",
      headers: ["Pattern", "Rule", "Example"],
      rows: [
        ["a + [color] + [singular item]", "For one item", "a red T-shirt / a blue jacket"],
        ["[color] + [plural item]", "No 'a' for plural items", "black shoes / blue jeans"],
        ["I'm wearing + [clothes]", "Say what you have on now", "I'm wearing a green sweater."],
        ["He / She is wearing...", "Describe another person", "She is wearing white sneakers."]
      ],
      tip: "Never say 'a T-shirt red'. Always put the color first: 'a red T-shirt'!"
    },
   
    {
      id: "4-4",
      type: "activity",
      activityType: "listening",
      title: "Listening: Identify the Outfit",
      instruction: "Listen to each description and choose the matching outfit.",
      questions: [
        {
          prompt: "Listen and select what Sara is wearing:",
          audioText: "Sara is wearing a red dress and black shoes.",
          options: ["A blue shirt and jeans", "A red dress and black shoes", "A green jacket and a hat"],
          answer: 1
        },
        {
          prompt: "Listen and select what Adam is wearing:",
          audioText: "Adam is wearing a white T-shirt, blue jeans, and a cap.",
          options: ["A white T-shirt, blue jeans, and a cap", "A yellow sweater and shorts", "A black jacket and red socks"],
          answer: 0
        }
      ]
    },
    {
      id: "4-5",
      type: "activity",
      activityType: "sentenceBuilder",
      title: "Describe the Outfit",
      instruction: "Arrange the words in the right English order (color before noun).",
      sentences: [
        {
          hint: "Say you are wearing a blue jacket",
          words: ["jacket.", "wearing", "a", "I'm", "blue"],
          target: "I'm wearing a blue jacket."
        },
        {
          hint: "Describe her black sneakers",
          words: ["wearing", "sneakers.", "She", "black", "is"],
          target: "She is wearing black sneakers."
        }
      ]
    },
    {
      id: "4-6",
      type: "completion",
      title: "Lesson Completed",
      message: "Fantastic! You can now name clothes, use colors, and describe what people are wearing."
    }
  ],

  // LESSON 5: Basic Grammar (9 slides)
  5: [
    {
      id: "5-1",
      type: "intro",
      title: "Lesson Introduction"
    },
    {
      id: "5-2",
      type: "grammar",
      title: "Subject Pronouns",
      subtitle: "Subject pronouns replace the name of a person or thing.",
      headers: ["Pronoun", "Meaning / Use", "Example"],
      rows: [
        ["I", "The speaker (myself)", "I am a student."],
        ["You", "The person you talk to", "You are my friend."],
        ["He", "One man or boy", "He is my brother."],
        ["She", "One woman or girl", "She is my teacher."],
        ["It", "One thing, animal, or place", "It is a big house."],
        ["We", "You and I together", "We are in Class A1."],
        ["They", "Two or more people/things", "They are from Morocco."]
      ],
      tip: "Always write the pronoun 'I' with a capital letter!"
    },
    {
      id: "5-3",
      type: "grammar",
      title: "Verb 'To Be' (Positive)",
      subtitle: "Match each subject pronoun with 'am', 'is', or 'are'.",
      headers: ["Subject", "Verb 'to be'", "Short Form", "Example"],
      rows: [
        ["I", "am", "I'm", "I am happy. / I'm happy."],
        ["He / She / It", "is", "He's / She's / It's", "She is 22. / She's 22."],
        ["You / We / They", "are", "You're / We're / They're", "We are ready. / We're ready."]
      ],
      tip: "Use 'is' for singular (1) and 'are' for plural (2 or more)."
    },
    {
      id: "5-4",
      type: "grammar",
      title: "Verb 'To Be' (Negative)",
      subtitle: "Add 'not' after am, is, or are to make a negative sentence.",
      headers: ["Positive", "Negative", "Short Negative", "Example"],
      rows: [
        ["I am", "I am not", "I'm not", "I'm not tired."],
        ["He / She / It is", "He / She / It is not", "isn't", "It isn't cold today."],
        ["You / We / They are", "You / We / They are not", "aren't", "They aren't late."]
      ],
      tip: "Both 'He is not' and 'He isn't' are completely correct!"
    },
    {
      id: "5-5",
      type: "grammar",
      title: "Articles: 'a' vs 'an'",
      subtitle: "Use 'a' before consonant sounds and 'an' before vowel sounds (a, e, i, o, u).",
      headers: ["Article", "When to Use", "Examples"],
      rows: [
        ["a", "Before consonant sounds (b, c, d, t, s...)", "a book, a teacher, a red car, a house"],
        ["an", "Before vowel sounds (a, e, i, o, u)", "an apple, an egg, an orange, an umbrella"]
      ],
      tip: "Only use 'a' or 'an' with ONE singular countable noun (never with plurals like 'books')."
    },
    {
      id: "5-6",
      type: "activity",
      activityType: "fillBlank",
      title: "Practice: Verb 'To Be'",
      instruction: "Select 'am', 'is', or 'are' for each sentence.",
      items: [
        {
          before: "I",
          options: ["am", "is", "are"],
          after: "from Agadir.",
          answer: "am"
        },
        {
          before: "My sister",
          options: ["am", "is", "are"],
          after: "a doctor.",
          answer: "is"
        },
        {
          before: "We",
          options: ["am", "is", "are"],
          after: "happy to learn English.",
          answer: "are"
        },
        {
          before: "They",
          options: ["am not", "isn't", "aren't"],
          after: "at home right now.",
          answer: "aren't"
        }
      ]
    },
    {
      id: "5-7",
      type: "activity",
      activityType: "mcq",
      title: "Practice: 'a' or 'an'?",
      instruction: "Choose the correct article for each word.",
      questions: [
        {
          prompt: "She is eating _____ apple.",
          options: ["a", "an"],
          answer: 1
        },
        {
          prompt: "This is _____ new T-shirt.",
          options: ["a", "an"],
          answer: 0
        },
        {
          prompt: "Take _____ umbrella with you!",
          options: ["a", "an"],
          answer: 1
        }
      ]
    },
    {
      id: "5-8",
      type: "activity",
      activityType: "matching",
      title: "Match Pronouns & Verbs",
      instruction: "Match each subject on the left with the correct verb form on the right.",
      pairs: [
        { left: "I", right: "am a student" },
        { left: "She", right: "is my aunt" },
        { left: "They", right: "are my parents" },
        { left: "It", right: "is a blue jacket" }
      ]
    },
    {
      id: "5-9",
      type: "completion",
      title: "Course & Lesson Completed",
      message: "Congratulations! You have mastered A1 Basic Grammar and completed all five A1 English lessons!"
    }
  ]
};
