import React, { useState } from "react";
import type { Quiz } from "./types";
import { GLOBAL_CSS, SAMPLE_QUIZZES } from "./constants";
import { useGameSocket } from "./hooks/useGameSocket";

import { HomeScreen, AuthScreen, JoinScreen, Dashboard } from "./screens/HomeScreens";
import { QuizEditor } from "./screens/QuizEditor";
import {
  LobbyScreen, GameScreen, LeaderboardScreen,
  ResultsScreen, ConnectingScreen, ErrorScreen,
} from "./screens/GameScreens";

type LocalScreen = "home" | "auth" | "join" | "dashboard" | "quiz-editor";

interface User { name: string; email: string; }

export default function App() {
  const [localScreen, setLocalScreen] = useState<LocalScreen>("home");
  const [user, setUser]               = useState<User | null>(null);
  const [quizzes, setQuizzes]         = useState<Quiz[]>(SAMPLE_QUIZZES);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();

  const {
    state: gs,
    createRoom, joinRoom, startGame,
    submitAnswer, nextQuestion, reset, isHost,
  } = useGameSocket();

  function goHome() {
    reset();
    setLocalScreen("home");
    setEditingQuiz(undefined);
  }

  function handleSaveQuiz(quiz: Quiz) {
    setQuizzes(qs => {
      const idx = qs.findIndex(q => q.id === quiz.id);
      return idx >= 0 ? qs.map((q, i) => i === idx ? quiz : q) : [...qs, quiz];
    });
    setLocalScreen("dashboard");
    setEditingQuiz(undefined);
  }

  // ── Socket-driven screens take priority ──────────────────────────────────────

  if (gs.phase === "connecting") return <><style>{GLOBAL_CSS}</style><ConnectingScreen /></>;

  if (gs.phase === "error") return <><style>{GLOBAL_CSS}</style><ErrorScreen message={gs.error ?? "Unknown error"} onBack={goHome} /></>;

  if (gs.phase === "lobby") {
    const amHost = isHost();
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <LobbyScreen
          roomCode={gs.room?.code ?? ""}
          isHost={amHost}
          players={gs.players}
          quizTitle={gs.room?.quiz.title ?? ""}
          onStart={startGame}
          onBack={goHome}
        />
      </>
    );
  }

  if (gs.phase === "question" && gs.question) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <GameScreen
          question={gs.question}
          questionIndex={gs.questionIndex}
          totalQuestions={gs.totalQuestions}
          timeLimit={gs.timeLimit}
          myScore={gs.myScore}
          quizTitle={gs.room?.quiz.title ?? ""}
          answerResult={gs.answerResult}
          onSubmit={submitAnswer}
        />
      </>
    );
  }

  if (gs.phase === "answer_result" && gs.question) {
    // Still show the game screen with the result banner visible
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <GameScreen
          question={gs.question}
          questionIndex={gs.questionIndex}
          totalQuestions={gs.totalQuestions}
          timeLimit={gs.timeLimit}
          myScore={gs.myScore}
          quizTitle={gs.room?.quiz.title ?? ""}
          answerResult={gs.answerResult}
          onSubmit={submitAnswer}
        />
      </>
    );
  }

  if (gs.phase === "leaderboard") {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <LeaderboardScreen
          players={gs.leaderboard}
          questionIndex={gs.questionIndex}
          totalQuestions={gs.totalQuestions}
          firstCorrectName={gs.firstCorrectName}
          isHost={isHost()}
          myId={gs.myId}
          onNext={nextQuestion}
        />
      </>
    );
  }

  if (gs.phase === "game_over" && gs.finalPlayers && gs.finalQuiz) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <ResultsScreen
          players={gs.finalPlayers}
          quiz={gs.finalQuiz}
          myId={gs.myId}
          onHome={goHome}
        />
      </>
    );
  }

  // ── Local navigation screens ─────────────────────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {localScreen === "home" && (
        <HomeScreen
          onHost={() => setLocalScreen("auth")}
          onJoin={() => setLocalScreen("join")}
        />
      )}

      {localScreen === "auth" && (
        <AuthScreen
          onBack={() => setLocalScreen("home")}
          onAuth={u => { setUser(u); setLocalScreen("dashboard"); }}
        />
      )}

      {localScreen === "join" && (
        <JoinScreen
          onBack={() => setLocalScreen("home")}
          onJoin={({ code, playerName }) => joinRoom(code, playerName)}
        />
      )}

      {localScreen === "dashboard" && user && (
        <Dashboard
          user={user}
          quizzes={quizzes}
          onCreateQuiz={() => { setEditingQuiz(undefined); setLocalScreen("quiz-editor"); }}
          onEditQuiz={q => { setEditingQuiz(q); setLocalScreen("quiz-editor"); }}
          onDeleteQuiz={id => setQuizzes(qs => qs.filter(q => q.id !== id))}
          onStartGame={(quiz, _code) => createRoom(user.name, quiz)}
          onImportQuiz={q => setQuizzes(qs => [...qs, q])}
          onBack={goHome}
        />
      )}

      {localScreen === "quiz-editor" && (
        <QuizEditor
          initial={editingQuiz}
          onBack={() => setLocalScreen(user ? "dashboard" : "home")}
          onSave={handleSaveQuiz}
        />
      )}
    </>
  );
}
