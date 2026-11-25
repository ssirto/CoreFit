(function () {
  'use strict';

  var areas = [
    ['Braccia e spalle', [
      ['shoulders', 'Spalle'], ['biceps', 'Bicipiti'], ['triceps', 'Tricipiti'], ['forearms', 'Avambracci']
    ]],
    ['Petto', [
      ['upper_chest', 'Petto alto'], ['mid_chest', 'Petto centrale'], ['lower_chest', 'Petto basso']
    ]],
    ['Gambe', [
      ['quadriceps', 'Quadricipiti'], ['glutes', 'Glutei'], ['adductors', 'Adduttori — Interno coscia'],
      ['abductors', 'Abduttori — Parte laterale dell’anca'], ['hamstrings', 'Femorali — Parte posteriore della coscia'],
      ['calves', 'Polpacci'], ['tibialis_anterior', 'Tibiale anteriore']
    ]],
    ['Core', [
      ['abdominals', 'Addominali'], ['obliques', 'Obliqui — Addominali laterali'], ['core_stability', 'Stabilizzatori del core']
    ]],
    ['Schiena', [
      ['trapezius', 'Trapezi'], ['lats', 'Gran dorsale'], ['upper_back', 'Schiena alta'], ['lower_back', 'Schiena bassa']
    ]]
  ];

  // Keep the canonical names stable. They supply IDs used by saved routines and sessions.
  // A name can appear in several groups and still produces a single catalog record.
  var classifications = {
    shoulders: [
      ["Deltoide anteriore", [
        "Barbell Overhead Press",
        "Seated Barbell Overhead Press",
        "Standing Dumbbell Shoulder Press",
        "Seated Dumbbell Shoulder Press",
        "Shoulder Press Machine",
        "Smith Machine Shoulder Press",
        "Arnold Press",
        "Dumbbell Front Raise",
        "Barbell Front Raise",
        "Cable Front Raise",
        "Plate Front Raise",
        "Single Arm Landmine Press",
        "Kneeling Landmine Press",
        "Pike Push-up",
        "Handstand Push-up",
        "Push Press"
      ]],
      ["Deltoide laterale", [
        "Standing Dumbbell Lateral Raise",
        "Seated Dumbbell Lateral Raise",
        "Single Arm Dumbbell Lateral Raise",
        "Cable Lateral Raise",
        "Behind-the-Body Cable Lateral Raise",
        "Leaning Cable Lateral Raise",
        "Lateral Raise Machine",
        "Incline Dumbbell Lateral Raise",
        "Resistance Band Lateral Raise",
        "Leaning Dumbbell Lateral Raise",
        "Upright Row"
      ]],
      ["Deltoide posteriore", [
        "Dumbbell Reverse Fly",
        "Bent Over Dumbbell Reverse Fly",
        "Cable Reverse Fly",
        "Single Arm Cable Reverse Fly",
        "Reverse Pec Deck",
        "Face Pull",
        "Rear Delt Dumbbell Row",
        "Rear Delt Cable Row",
        "Chest Supported Rear Delt Fly",
        "Incline Bench Rear Delt Raise",
        "Resistance Band Pull Apart",
        "Resistance Band Face Pull"
      ]]
    ],
    biceps: [
      ["", [
        "Barbell Curl",
        "EZ Bar Curl",
        "Standing Dumbbell Curl",
        "Alternating Dumbbell Curl",
        "Seated Dumbbell Curl",
        "Incline Dumbbell Curl",
        "Hammer Curl",
        "Seated Hammer Curl",
        "Cross Body Hammer Curl",
        "Rope Hammer Curl",
        "Concentration Curl",
        "EZ Bar Preacher Curl",
        "Dumbbell Preacher Curl",
        "Machine Preacher Curl",
        "Single Arm Preacher Curl",
        "Standing Cable Curl",
        "Single Arm Cable Curl",
        "Bayesian Cable Curl",
        "Behind-the-Body Cable Curl",
        "High Cable Curl",
        "Spider Curl",
        "Drag Curl",
        "Zottman Curl",
        "Reverse Barbell Curl",
        "Reverse EZ Bar Curl",
        "Resistance Band Biceps Curl",
        "Chin-up",
        "Weighted Chin-up",
        "Assisted Chin-up",
        "Bodyweight Biceps Curl"
      ]]
    ],
    triceps: [
      ["", [
        "Rope Triceps Pushdown",
        "Straight Bar Triceps Pushdown",
        "V-Bar Triceps Pushdown",
        "Reverse Grip Triceps Pushdown",
        "Single Arm Triceps Pushdown",
        "Single Arm Reverse Grip Pushdown",
        "Dumbbell Overhead Triceps Extension",
        "Single Arm Dumbbell Overhead Extension",
        "Cable Overhead Triceps Extension",
        "Single Arm Cable Overhead Extension",
        "EZ Bar Skull Crusher",
        "Barbell Skull Crusher",
        "Dumbbell Skull Crusher",
        "Incline Skull Crusher",
        "French Press",
        "JM Press",
        "Tate Press",
        "Dumbbell Triceps Kickback",
        "Cable Triceps Kickback",
        "Close Grip Bench Press",
        "Smith Machine Close Grip Bench Press",
        "Triceps Dips",
        "Weighted Triceps Dips",
        "Assisted Triceps Dips",
        "Bench Dips",
        "Diamond Push-up",
        "Close Grip Push-up",
        "Triceps Extension Machine",
        "Triceps Dip Machine",
        "Resistance Band Triceps Pushdown",
        "Resistance Band Overhead Extension",
        "Bodyweight Triceps Extension"
      ]]
    ],
    forearms: [
      ["Flessori ed estensori del polso", [
        "Barbell Wrist Curl",
        "Dumbbell Wrist Curl",
        "Behind-the-Back Barbell Wrist Curl",
        "Reverse Barbell Wrist Curl",
        "Reverse Dumbbell Wrist Curl",
        "Cable Wrist Curl",
        "Reverse Cable Wrist Curl",
        "Wrist Roller",
        "Dumbbell Wrist Pronation",
        "Dumbbell Wrist Supination",
        "Wrist Radial Deviation",
        "Wrist Ulnar Deviation",
        "Resistance Band Wrist Curl",
        "Resistance Band Wrist Extension"
      ]],
      ["Brachioradiale e forza della presa", [
        "Hammer Curl",
        "Reverse Barbell Curl",
        "Reverse EZ Bar Curl",
        "Reverse Dumbbell Curl",
        "Zottman Curl",
        "Farmer's Walk",
        "Suitcase Carry",
        "Dead Hang",
        "Weighted Dead Hang",
        "Towel Hang",
        "Plate Pinch",
        "Hand Gripper",
        "Dumbbell Static Hold",
        "Barbell Static Hold",
        "Trap Bar Carry",
        "Fingertip Hang"
      ]]
    ],
    upper_chest: [
      ["", [
        "Incline Barbell Bench Press",
        "Incline Dumbbell Bench Press",
        "Incline Smith Machine Bench Press",
        "Incline Chest Press Machine",
        "Incline Dumbbell Fly",
        "Incline Cable Fly",
        "Low-to-High Cable Fly",
        "Single Arm Low-to-High Cable Fly",
        "Incline Cable Chest Press",
        "Incline Squeeze Press",
        "Reverse Grip Bench Press",
        "Decline Push-up",
        "Resistance Band Low-to-High Fly",
        "Incline Resistance Band Chest Press",
        "Incline Dumbbell Hex Press"
      ]]
    ],
    mid_chest: [
      ["", [
        "Barbell Bench Press",
        "Dumbbell Bench Press",
        "Smith Machine Bench Press",
        "Flat Chest Press Machine",
        "Seated Chest Press Machine",
        "Hammer Strength Chest Press",
        "Single Arm Machine Chest Press",
        "Flat Dumbbell Fly",
        "Flat Cable Fly",
        "Standing Cable Fly",
        "Single Arm Cable Fly",
        "Cable Crossover",
        "Pec Deck",
        "Standing Cable Chest Press",
        "Single Arm Cable Chest Press",
        "Push-up",
        "Wide Grip Push-up",
        "Weighted Push-up",
        "Deficit Push-up",
        "Archer Push-up",
        "Ring Push-up",
        "Dumbbell Squeeze Press",
        "Dumbbell Hex Press",
        "Barbell Floor Press",
        "Dumbbell Floor Press",
        "Resistance Band Chest Press",
        "Resistance Band Chest Fly"
      ]]
    ],
    lower_chest: [
      ["", [
        "Decline Barbell Bench Press",
        "Decline Dumbbell Bench Press",
        "Decline Smith Machine Bench Press",
        "Decline Chest Press Machine",
        "Decline Dumbbell Fly",
        "Decline Cable Fly",
        "High-to-Low Cable Fly",
        "Single Arm High-to-Low Cable Fly",
        "Chest Dips",
        "Weighted Chest Dips",
        "Assisted Chest Dips",
        "Incline Push-up",
        "Decline Cable Chest Press",
        "Resistance Band High-to-Low Fly"
      ]]
    ],
    quadriceps: [
      ["", [
        "Barbell Back Squat",
        "High Bar Squat",
        "Low Bar Squat",
        "Front Squat",
        "Goblet Squat",
        "Dumbbell Squat",
        "Zercher Squat",
        "Safety Bar Squat",
        "Smith Machine Squat",
        "Hack Squat",
        "Reverse Hack Squat",
        "Pendulum Squat",
        "Belt Squat",
        "45 Degree Leg Press",
        "Horizontal Leg Press",
        "Vertical Leg Press",
        "Single Leg Press",
        "Narrow Stance Leg Press",
        "Leg Extension",
        "Single Leg Extension",
        "Bulgarian Split Squat",
        "Dumbbell Bulgarian Split Squat",
        "Smith Machine Bulgarian Split Squat",
        "Forward Lunge",
        "Reverse Lunge",
        "Walking Lunge",
        "Dumbbell Lunge",
        "Barbell Lunge",
        "Step-up",
        "Weighted Step-up",
        "Sissy Squat",
        "Pistol Squat",
        "Assisted Pistol Squat",
        "Cyclist Squat",
        "Heel Elevated Squat",
        "Spanish Squat",
        "Wall Sit",
        "Weighted Wall Sit",
        "Bodyweight Squat",
        "Jump Squat",
        "Box Squat",
        "Reverse Nordic Curl",
        "Resistance Band Squat"
      ]]
    ],
    glutes: [
      ["Grande gluteo", [
        "Barbell Hip Thrust",
        "Dumbbell Hip Thrust",
        "Smith Machine Hip Thrust",
        "Hip Thrust Machine",
        "Single Leg Hip Thrust",
        "B-Stance Hip Thrust",
        "Bodyweight Hip Thrust",
        "Barbell Glute Bridge",
        "Dumbbell Glute Bridge",
        "Bodyweight Glute Bridge",
        "Single Leg Glute Bridge",
        "Frog Pumps",
        "Cable Glute Kickback",
        "Glute Kickback Machine",
        "Donkey Kick",
        "Resistance Band Donkey Kick",
        "Standing Cable Hip Extension",
        "Cable Pull Through",
        "Sumo Squat",
        "Sumo Deadlift",
        "Glute-Focused Bulgarian Split Squat",
        "Glute-Focused Reverse Lunge",
        "High Step-up",
        "Curtsy Lunge",
        "Kettlebell Swing",
        "Glute-Focused Back Extension",
        "Reverse Hyperextension"
      ]],
      ["Medio e piccolo gluteo", [
        "Fire Hydrant",
        "Resistance Band Fire Hydrant",
        "Clamshell",
        "Resistance Band Clamshell",
        "Side Lying Hip Abduction",
        "Lateral Band Walk",
        "Monster Walk",
        "Hip Abduction Machine",
        "Cable Hip Abduction"
      ]]
    ],
    adductors: [
      ["", [
        "Hip Adduction Machine",
        "Standing Cable Hip Adduction",
        "Standing Resistance Band Hip Adduction",
        "Side Lying Hip Adduction",
        "Copenhagen Plank",
        "Short Lever Copenhagen Plank",
        "Copenhagen Hip Adduction",
        "Sumo Squat",
        "Sumo Deadlift",
        "Wide Stance Leg Press",
        "Lateral Lunge",
        "Dumbbell Lateral Lunge",
        "Cossack Squat",
        "Sliding Lateral Lunge",
        "Seated Ball Adduction Squeeze"
      ]]
    ],
    abductors: [
      ["", [
        "Hip Abduction Machine",
        "Standing Cable Hip Abduction",
        "Standing Hip Abduction",
        "Standing Resistance Band Hip Abduction",
        "Side Lying Hip Abduction",
        "Clamshell",
        "Resistance Band Clamshell",
        "Lateral Band Walk",
        "Monster Walk",
        "Fire Hydrant",
        "Resistance Band Fire Hydrant",
        "Side Plank Hip Abduction",
        "Lateral Step-up",
        "Hip Hike"
      ]]
    ],
    hamstrings: [
      ["", [
        "Barbell Romanian Deadlift",
        "Dumbbell Romanian Deadlift",
        "Smith Machine Romanian Deadlift",
        "Single Leg Romanian Deadlift",
        "B-Stance Romanian Deadlift",
        "Barbell Stiff Leg Deadlift",
        "Dumbbell Stiff Leg Deadlift",
        "Lying Leg Curl",
        "Seated Leg Curl",
        "Standing Leg Curl",
        "Single Leg Lying Leg Curl",
        "Single Leg Seated Leg Curl",
        "Cable Leg Curl",
        "Nordic Hamstring Curl",
        "Assisted Nordic Hamstring Curl",
        "Glute Ham Raise",
        "Sliding Leg Curl",
        "Single Leg Sliding Leg Curl",
        "Stability Ball Leg Curl",
        "Single Leg Stability Ball Leg Curl",
        "Barbell Good Morning",
        "Resistance Band Leg Curl",
        "Hamstring Walkout",
        "Kettlebell Romanian Deadlift"
      ]]
    ],
    calves: [
      ["Gastrocnemio", [
        "Standing Calf Raise",
        "Standing Calf Raise Machine",
        "Smith Machine Standing Calf Raise",
        "Dumbbell Standing Calf Raise",
        "Single Leg Standing Calf Raise",
        "Single Leg Dumbbell Calf Raise",
        "Leg Press Calf Raise",
        "Single Leg Press Calf Raise",
        "Donkey Calf Raise",
        "Bodyweight Calf Raise",
        "Deficit Calf Raise",
        "Farmer's Walk on Toes"
      ]],
      ["Soleo", [
        "Seated Calf Raise",
        "Seated Calf Raise Machine",
        "Seated Dumbbell Calf Raise",
        "Seated Barbell Calf Raise",
        "Single Leg Seated Calf Raise",
        "Bent Knee Calf Raise"
      ]]
    ],
    tibialis_anterior: [
      ["", [
        "Tibialis Raise",
        "Wall Tibialis Raise",
        "Tibialis Raise Machine",
        "Weighted Tibialis Raise",
        "Single Leg Tibialis Raise",
        "Cable Ankle Dorsiflexion",
        "Resistance Band Ankle Dorsiflexion",
        "Heel Walk"
      ]]
    ],
    abdominals: [
      ["", [
        "Crunch",
        "Weighted Crunch",
        "Cable Crunch",
        "Kneeling Cable Crunch",
        "Standing Cable Crunch",
        "Ab Crunch Machine",
        "Decline Crunch",
        "Weighted Decline Crunch",
        "Reverse Crunch",
        "Decline Reverse Crunch",
        "Sit-up",
        "Weighted Sit-up",
        "Decline Sit-up",
        "Weighted Decline Sit-up",
        "Butterfly Sit-up",
        "Lying Leg Raise",
        "Hanging Leg Raise",
        "Hanging Knee Raise",
        "Weighted Hanging Knee Raise",
        "Captain's Chair Leg Raise",
        "Captain's Chair Knee Raise",
        "Flutter Kicks",
        "Scissor Kicks",
        "V-up",
        "Single Leg V-up",
        "Toe Touch Crunch",
        "Jackknife Sit-up",
        "Ab Wheel Rollout",
        "Kneeling Ab Wheel Rollout",
        "Standing Ab Wheel Rollout",
        "Dragon Flag",
        "Hollow Body Hold",
        "Hollow Body Rock",
        "Stability Ball Crunch",
        "TRX Crunch",
        "TRX Knee Tuck",
        "Toes to Bar",
        "Garhammer Raise"
      ]]
    ],
    obliques: [
      ["", [
        "Russian Twist",
        "Weighted Russian Twist",
        "Cable Russian Twist",
        "Side Plank",
        "Weighted Side Plank",
        "Side Plank Hip Dip",
        "Side Plank Rotation",
        "Cable Woodchopper",
        "Low-to-High Cable Woodchopper",
        "High-to-Low Cable Woodchopper",
        "Resistance Band Woodchopper",
        "Dumbbell Side Bend",
        "Cable Side Bend",
        "Bicycle Crunch",
        "Oblique Crunch",
        "Side Lying Crunch",
        "Hanging Oblique Knee Raise",
        "Hanging Windshield Wiper",
        "Lying Windshield Wiper",
        "Heel Touches",
        "Suitcase Carry",
        "Single Arm Farmer's Walk",
        "Landmine Rotation",
        "Cable Torso Rotation",
        "Oblique V-up"
      ]]
    ],
    core_stability: [
      ["", [
        "Forearm Plank",
        "High Plank",
        "Weighted Plank",
        "RKC Plank",
        "Long Lever Plank",
        "Single Arm Plank",
        "Single Leg Plank",
        "Shoulder Tap Plank",
        "Plank Reach",
        "Plank Walk",
        "Dead Bug",
        "Weighted Dead Bug",
        "Resistance Band Dead Bug",
        "Bird Dog",
        "Bird Dog Row",
        "Pallof Press",
        "Kneeling Pallof Press",
        "Pallof Press Hold",
        "Resistance Band Pallof Press",
        "Bear Crawl",
        "Bear Plank",
        "Body Saw",
        "Stability Ball Rollout",
        "Stability Ball Stir the Pot",
        "Mountain Climber",
        "Slow Mountain Climber",
        "TRX Plank",
        "TRX Body Saw",
        "Front Rack Carry",
        "Overhead Carry",
        "Turkish Get-up"
      ]]
    ],
    trapezius: [
      ["Trapezio superiore", [
        "Barbell Shrug",
        "Dumbbell Shrug",
        "Cable Shrug",
        "Smith Machine Shrug",
        "Trap Bar Shrug",
        "Behind-the-Back Barbell Shrug",
        "Incline Dumbbell Shrug",
        "Overhead Shrug",
        "Farmer's Walk",
        "Trap Bar Carry",
        "Upright Row"
      ]],
      ["Trapezio medio e inferiore", [
        "Face Pull",
        "Prone Y Raise",
        "Incline Y Raise",
        "Cable Y Raise",
        "Prone T Raise",
        "Prone W Raise",
        "Prone Trap Raise",
        "Scapular Pull-up",
        "Scapular Row",
        "Scapular Retraction",
        "Kelso Shrug",
        "Resistance Band Pull Apart"
      ]]
    ],
    lats: [
      ["Tirate verticali", [
        "Pull-up",
        "Wide Grip Pull-up",
        "Close Grip Pull-up",
        "Neutral Grip Pull-up",
        "Chin-up",
        "Weighted Pull-up",
        "Assisted Pull-up",
        "Resistance Band Assisted Pull-up",
        "Commando Pull-up",
        "Wide Grip Lat Pulldown",
        "Close Grip Lat Pulldown",
        "Neutral Grip Lat Pulldown",
        "Reverse Grip Lat Pulldown",
        "Single Arm Lat Pulldown",
        "Kneeling Single Arm Lat Pulldown",
        "Unilateral Lat Pulldown Machine",
        "Resistance Band Lat Pulldown"
      ]],
      ["Tirate orizzontali con enfasi sul dorsale", [
        "Single Arm Dumbbell Row",
        "Lat-Focused Dumbbell Row",
        "Single Arm Cable Row",
        "Single Arm Lat-Focused Cable Row",
        "Seated Close Grip Cable Row",
        "Close Grip Machine Row",
        "Lat-Focused Machine Row",
        "Meadows Row"
      ]],
      ["Estensioni della spalla", [
        "Straight Arm Pulldown",
        "Rope Straight Arm Pulldown",
        "Single Arm Straight Arm Pulldown",
        "Cable Pullover",
        "Dumbbell Pullover",
        "Machine Pullover",
        "Resistance Band Straight Arm Pulldown"
      ]]
    ],
    upper_back: [
      ["Tirate orizzontali", [
        "Barbell Row",
        "Pendlay Row",
        "Yates Row",
        "Dumbbell Row",
        "Single Arm Dumbbell Row",
        "Chest Supported Dumbbell Row",
        "T-Bar Row",
        "Chest Supported T-Bar Row",
        "Seal Row",
        "Meadows Row",
        "Kroc Row",
        "Seated Cable Row",
        "Wide Grip Cable Row",
        "Single Arm Cable Row",
        "Machine Row",
        "Chest Supported Machine Row",
        "High Row Machine",
        "Wide Grip Machine Row",
        "Inverted Row",
        "Ring Row",
        "TRX Row",
        "Resistance Band Row"
      ]],
      ["Retrattori scapolari", [
        "Face Pull",
        "Rear Delt Dumbbell Row",
        "Rear Delt Cable Row",
        "Prone T Raise",
        "Prone W Raise",
        "Scapular Row",
        "Reverse Pec Deck"
      ]]
    ],
    lower_back: [
      ["Estensori spinali", [
        "Conventional Deadlift",
        "Sumo Deadlift",
        "Trap Bar Deadlift",
        "Dumbbell Deadlift",
        "Rack Pull",
        "Block Pull",
        "Deficit Deadlift",
        "Barbell Romanian Deadlift",
        "Barbell Good Morning",
        "Seated Good Morning",
        "Back Extension",
        "45 Degree Back Extension",
        "Weighted Back Extension",
        "Reverse Hyperextension",
        "Lumbar Extension Machine",
        "Superman",
        "Superman Hold",
        "Bird Dog"
      ]]
    ]
  };

  var aliases = {
    "Barbell Bench Press": ["Panca piana","Panca piana con bilanciere","Flat Barbell Bench Press"],
    "Dumbbell Bench Press": ["Panca piana con manubri","Flat Dumbbell Bench Press"],
    "Incline Barbell Bench Press": ["Panca inclinata","Panca inclinata con bilanciere"],
    "Incline Dumbbell Bench Press": ["Panca inclinata con manubri"],
    "Decline Barbell Bench Press": ["Panca declinata"],
    "Pec Deck": ["Butterfly","Croci alla macchina"],
    "Barbell Overhead Press": ["Military Press","Overhead Press"],
    "Seated Dumbbell Shoulder Press": ["Shoulder press","Shoulder press con manubri"],
    "Standing Dumbbell Lateral Raise": ["Alzate laterali","Alzate laterali con manubri"],
    "Dumbbell Front Raise": ["Alzate frontali","Alzate frontali con manubri"],
    "Barbell Curl": ["Curl con bilanciere"],
    "Standing Dumbbell Curl": ["Curl manubri","Curl con manubri","Dumbbell Curl"],
    "EZ Bar Preacher Curl": ["Panca Scott","Preacher Curl"],
    "Standing Cable Curl": ["Cable Curl","Curl ai cavi"],
    "Rope Triceps Pushdown": ["Pushdown tricipiti","Pushdown con corda"],
    "Barbell Back Squat": ["Squat","Squat con bilanciere","Back Squat"],
    "Forward Lunge": ["Affondi","Affondi in avanti","Forward Lunges"],
    "Reverse Lunge": ["Affondi all’indietro","Reverse Lunges"],
    "45 Degree Leg Press": ["Leg Press","Pressa a 45 gradi","Pressa"],
    "Leg Extension": ["Estensione delle gambe"],
    "Lying Leg Curl": ["Leg curl","Leg curl da sdraiato"],
    "Barbell Romanian Deadlift": ["Stacco rumeno","Romanian Deadlift","RDL"],
    "Conventional Deadlift": ["Stacco da terra","Deadlift"],
    "Barbell Hip Thrust": ["Hip Thrust","Hip Thrust con bilanciere"],
    "Hip Adduction Machine": ["Adductor Machine"],
    "Hip Abduction Machine": ["Abductor Machine"],
    "Barbell Row": ["Rematore","Rematore con bilanciere","Bent Over Barbell Row"],
    "Single Arm Dumbbell Row": ["Rematore con manubrio"],
    "Wide Grip Lat Pulldown": ["Lat machine","Lat Pulldown","Lat Machine presa larga"],
    "Forearm Plank": ["Plank","Plank sugli avambracci"],
    "Pull-up": ["Trazioni","Trazioni alla sbarra"],
    "Chin-up": ["Trazioni supine"],
    "Push-up": ["Piegamenti","Flessioni"]
  };

  var secondaryGroups = {
    "Barbell Bench Press": ['shoulders', 'triceps'],
    "Dumbbell Bench Press": ['shoulders', 'triceps'],
    "Incline Barbell Bench Press": ['shoulders', 'triceps'],
    "Incline Dumbbell Bench Press": ['shoulders', 'triceps'],
    "Barbell Overhead Press": ['triceps', 'core_stability'],
    "Push-up": ['shoulders', 'triceps', 'core_stability'],
    "Pull-up": ['biceps', 'upper_back', 'forearms'],
    "Chin-up": ['upper_back', 'forearms'],
    "Barbell Back Squat": ['glutes', 'adductors', 'core_stability'],
    "Barbell Romanian Deadlift": ['glutes', 'forearms'],
    "Conventional Deadlift": ['hamstrings', 'glutes', 'quadriceps', 'forearms'],
    "Barbell Hip Thrust": ['hamstrings'],
    "Barbell Row": ['lats', 'biceps', 'lower_back'],
    "Wide Grip Lat Pulldown": ['biceps', 'upper_back'],
    "Forearm Plank": ['abdominals', 'obliques'],
    "Suitcase Carry": ['forearms', 'core_stability']
  };

  var equipmentLabels = {
    barbell: 'Bilanciere', ez_bar: 'Bilanciere EZ', dumbbell: 'Manubri', machine: 'Macchinario',
    cable: 'Cavi', smith_machine: 'Multipower', bodyweight: 'Corpo libero', resistance_band: 'Elastici',
    kettlebell: 'Kettlebell', other: 'Altro'
  };
  var tracking = {
    weight_reps: { weight: 'Peso (kg)', field: 'reps', label: 'Ripetizioni', short: 'Rip.', initial: 10 },
    bodyweight_reps: { field: 'reps', label: 'Ripetizioni', short: 'Rip.', initial: 10 },
    weighted_bodyweight: { weight: 'Sovraccarico (kg)', field: 'reps', label: 'Ripetizioni', short: 'Rip.', initial: 10 },
    assisted_reps: { weight: 'Assistenza (kg)', field: 'reps', label: 'Ripetizioni', short: 'Rip.', initial: 10 },
    duration: { field: 'seconds', label: 'Tempo (s)', short: 'Sec.', initial: 30 },
    weight_duration: { weight: 'Peso (kg)', field: 'seconds', label: 'Tempo (s)', short: 'Sec.', initial: 30 },
    distance: { field: 'meters', label: 'Distanza (m)', short: 'Metri', initial: 20 },
    weight_distance: { weight: 'Peso (kg)', field: 'meters', label: 'Distanza (m)', short: 'Metri', initial: 20 }
  };

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function equipmentFor(name) {
    if (/smith machine/i.test(name)) return 'smith_machine';
    if (/band/i.test(name)) return 'resistance_band';
    if (/\bEZ Bar\b/i.test(name)) return 'ez_bar';
    if (/\bdumbbell\b/i.test(name)) return 'dumbbell';
    if (/\bkettlebell\b/i.test(name)) return 'kettlebell';
    if (/\bcable\b|pulldown|rope.*(curl|pushdown)|pushdown/i.test(name)) return 'cable';
    if (/machine|pec deck|leg press|leg (curl|extension)|hack squat|pendulum squat|belt squat|^assisted (pull-up|chin-up|triceps dips|chest dips)/i.test(name)) return 'machine';
    if (/barbell|landmine|trap bar|deadlift|rack pull|back squat|front squat|good morning|^b.stance romanian|t-bar row|^pendlay row|^yates row|^meadows row/i.test(name)) return 'barbell';
    if (/trx|ring|ball|ab wheel|plate|hand gripper|wrist roller|farmer|carry|weighted|goblet squat/i.test(name)) return 'other';
    return 'bodyweight';
  }

  function trackingFor(name, equipment) {
    if (/farmer|carry|bear crawl|heel walk|band walk|monster walk/i.test(name)) {
      return /weight|farmer|carry/i.test(name) ? 'weight_distance' : 'distance';
    }
    if (/plank|hang$|hollow body hold|wall sit|static hold|plate pinch|pallof press hold|superman hold/i.test(name) &&
        !/hip (dip|abduction|adduction)|plank (rotation|walk|reach)|shoulder tap/i.test(name)) {
      return /weighted|static hold|plate pinch/i.test(name) ? 'weight_duration' : 'duration';
    }
    if (name === 'Resistance Band Assisted Pull-up') return 'bodyweight_reps';
    if (/^assisted (pull-up|chin-up|triceps dips|chest dips)/i.test(name)) return 'assisted_reps';
    if (/^weighted/i.test(name)) return 'weighted_bodyweight';
    return equipment === 'bodyweight' || equipment === 'resistance_band' ? 'bodyweight_reps' : 'weight_reps';
  }

  var byId = Object.create(null);
  var byName = Object.create(null);
  Object.keys(classifications).forEach(function (group) {
    classifications[group].forEach(function (section) {
      section[1].forEach(function (name) {
        var id = normalize(name).replace(/ /g, '_');
        var entry = byId[id];
        if (!entry) {
          var equipment = equipmentFor(name);
          entry = byId[id] = {
            id: id, name: name, aliases: aliases[name] || [], muscleGroups: [], subgroups: [],
            secondaryMuscles: secondaryGroups[name] || [], equipment: equipment,
            trackingType: trackingFor(name, equipment)
          };
          byName[normalize(name)] = entry;
          entry.aliases.forEach(function (alias) { byName[normalize(alias)] = entry; });
        }
        if (entry.muscleGroups.indexOf(group) === -1) entry.muscleGroups.push(group);
        if (section[0]) entry.subgroups.push({ group: group, label: section[0] });
      });
    });
  });
  var entries = Object.keys(byId).map(function (id) { return byId[id]; });

  function find(id, name, custom) {
    if (id) return byId[id] || (custom || []).find(function (entry) { return entry.id === id; }) || null;
    return byName[normalize(name)] || null;
  }

  function search(filters, custom) {
    var query = normalize(filters.query);
    var terms = query ? query.split(' ') : [];
    return entries.concat(custom || []).filter(function (entry) {
      if (filters.group && entry.muscleGroups.indexOf(filters.group) === -1) return false;
      if (filters.equipment && entry.equipment !== filters.equipment) return false;
      return [entry.name].concat(entry.aliases).some(function (name) {
        var normalized = normalize(name);
        return terms.every(function (term) { return normalized.indexOf(term) !== -1; });
      });
    }).sort(function (a, b) { return a.name.localeCompare(b.name, 'en'); });
  }

  function mode(exercise) {
    var type = exercise.trackingType || 'weight_reps';
    return tracking[type] || tracking.weight_reps;
  }

  window.CoreFitExercises = {
    areas: areas, entries: entries, equipmentLabels: equipmentLabels, tracking: tracking,
    find: find, search: search, normalize: normalize, mode: mode
  };
}());
