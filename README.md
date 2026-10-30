# CoreFit — Gamified Fitness Tracking

**CoreFit** is a gamified fitness tracking application that combines workout management, performance analytics, and game-inspired progression systems to make fitness more engaging, motivating, and rewarding.

## Target Audience

CoreFit is designed for gym enthusiasts, fitness beginners, and experienced athletes who want to organize their workouts, track their progress, and stay motivated through an interactive fitness experience.

Whether users are starting their fitness journey or working toward advanced training goals, CoreFit provides the tools to support consistent improvement.

## Key Features

- **Workout Tracking:** Log exercises, sets, repetitions, weights, and completed training sessions.
- **Workout Routines:** Create, customize, and manage personal training routines.
- **Progress Analytics:** Monitor workout history, personal records, performance statistics, and improvements over time.
- **Gamification System:** Earn experience points (XP), level up, and unlock achievements through training activities.
- **Challenges & Milestones:** Complete fitness challenges and reach milestones to earn additional rewards.
- **Personalized Dashboard:** Access workout statistics, progression levels, achievements, and training activity in one place.
- **Fitness Goals:** Set personal objectives and track progress toward achieving them.

## User Journey

1. **Create a Profile:** Sign up, enter personal fitness information, and define training goals.
2. **Build a Routine:** Create a workout plan by selecting exercises, sets, repetitions, and target weights.
3. **Start Training:** Follow the selected routine and log exercises during each workout session.
4. **Earn Rewards:** Complete workouts, maintain training streaks, and achieve milestones to gain XP and unlock achievements.
5. **Track Progress:** Review performance statistics, workout history, and personal records through the dashboard.
6. **Level Up:** Progress through levels, complete new challenges, and continuously improve fitness performance.

## Rewards & Progression System

CoreFit rewards users for consistency, dedication, and measurable progress rather than simply the amount of weight lifted.

Users can earn rewards through:

- **Workout Completion:** Gain XP for successfully completing training sessions.
- **Consistency Streaks:** Receive bonus XP for maintaining regular workout habits.
- **Personal Records:** Earn additional XP and achievements when reaching new performance milestones.
- **Challenges:** Complete daily, weekly, and long-term fitness objectives to unlock rewards.
- **Level Progression:** Accumulate XP to increase account levels and unlock new achievements and progression milestones.

The reward system is designed to encourage sustainable training habits while keeping progression accessible to users of all experience levels.

## CoreFit Premium

CoreFit Premium will introduce advanced personalization and intelligent training tools for users seeking a more tailored fitness experience.

### Personalized Training Schedule

A customized training schedule designed around each user's individual needs, including:

- Personal fitness goals and experience level.
- Preferred training days and weekly availability.
- Workout frequency and session duration.
- Muscle group distribution and recovery periods.
- Progressive adjustments based on training performance.

Users will be able to follow a structured weekly training plan that adapts to their availability, objectives, and progress.

### AI Fitness Coach

An AI-powered virtual coach that provides personalized guidance and training assistance.

Planned capabilities include:

- **Personalized Recommendations:** Suggest exercises, routines, and training adjustments based on individual goals.
- **Workout Analysis:** Evaluate recorded training data to identify performance trends and areas for improvement.
- **Adaptive Training Plans:** Recommend modifications to training intensity, volume, and exercise selection.
- **Progress Insights:** Provide feedback on consistency, performance, and overall development.
- **Interactive Assistance:** Answer fitness-related questions and help users understand exercises, training techniques, and workout strategies.
- **Recovery Guidance:** Suggest rest periods and workload adjustments based on recorded training activity.

### Advanced Analytics

Premium users will also have access to more detailed performance insights, including:

- Exercise-specific progression charts.
- Training volume and frequency analysis.
- Long-term performance comparisons.
- Muscle group training distribution.
- Personalized progress reports.

## Project Goal

CoreFit aims to transform traditional fitness tracking into an **interactive, rewarding, and personalized fitness experience**.

By combining structured workout management, meaningful progression mechanics, and AI-powered coaching, CoreFit encourages users to build consistent training habits, achieve their goals, and make long-term fitness progress.

*CoreFit is under development. Premium features and advanced AI capabilities are planned for future releases.*

## Prototipo navigabile

Una prima anteprima mobile è disponibile in [`prototype/`](prototype/). Include onboarding, login simulato, dashboard, elenco delle routine, schermata dell'allenamento, statistiche e profilo. La navigazione usa link HTML; routine, serie e sessioni sono gestite da `prototype/corefit.js` e salvate nella memoria locale del browser. La dashboard, lo storico e il profilo mostrano i dati degli allenamenti completati.

La seconda fase aggiunge XP, livelli, streak giornaliera, achievement, sfide settimanali e mensili, notifiche nell'app e una dashboard più ricca. `prototype/gamification.js` calcola i progressi dalle sessioni registrate: 200 XP per livello, XP per allenamenti e traguardi, sfide che si rinnovano senza togliere gli XP già guadagnati. Le notifiche lette sono salvate localmente. Non sono ancora presenti notifiche push, database o login reale; i dati non si sincronizzano tra dispositivi.

Il percorso di accesso mostra l'introduzione solo alla prima visita su quel browser, poi propone accesso con Email, Google, Apple o registrazione. Nel prototipo funziona solo l'account email locale: la password di prova viene verificata sul dispositivo con PBKDF2 e non salvata in chiaro, mentre la sessione resta attiva fino all'uscita esplicita. Google e Apple sono visibili ma non attivi finché non saranno configurati OAuth e un servizio di autenticazione. Questa demo locale non verifica la proprietà dell'indirizzo email, non offre recupero password e **non è un sistema di autenticazione sicuro per dati reali**. Usa una password di prova diversa da quelle personali.

La registrazione richiede uno username; l'accesso accetta lo username oppure l'email insieme alla password. Gli account locali creati in precedenza con il campo Nome restano utilizzabili tramite email.

L'[anteprima online privata](https://corefit-mobile-preview.jauntynova15.chatgpt.site) è accessibile al proprietario del progetto e viene aggiornata quando pubblichiamo una nuova versione. Le pagine sono navigabili anche con i pulsanti Avanti e Indietro del browser.

Per aprirla localmente, dalla cartella principale del progetto esegui:

```bash
python3 -m http.server 8000
```

Poi visita `http://localhost:8000/prototype/` nel browser. Da telefono, usa l'indirizzo del computer sulla stessa rete al posto di `localhost`.

Su Windows PowerShell, dalla cartella principale del progetto, usa `python -m http.server 8000` oppure `py -m http.server 8000`. Se hai scaricato uno ZIP, scarica una nuova copia per ricevere gli aggiornamenti del prototipo.
