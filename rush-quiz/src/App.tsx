import React, { useState } from "react";
import type { Quiz, GameState, Screen, Player } from "./types";
import { GLOBAL_CSS, SAMPLE_QUIZZES } from "./constants";
import { generateRoomCode } from "./utils";

import { HomeScreen, AuthScreen, JoinScreen, Dashboard } from "./screens/HomeScreens";
import { QuizEditor } from "./screens/QuizEditor";
import { LobbyScreen, GameScreen, ResultsScreen } from "./screens/GameScreens";

interface User { name: string; email: string; }

export default function App() {
  const [screen, setScreen]     = useState<Screen>("home");
  const [user, setUser]         = useState<User | null>(null);
  const [quizzes, setQuizzes]   = useState<Quiz[]>(SAMPLE_QUIZZES);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();
  const [gameState, setGameState] = useState<Partial<GameState>>({});

  function goHome() {
    setScreen("home");
    setGameState({});
    setEditingQuiz(undefined);
  }

  function handleAuth(u: User) {
    setUser(u);
    setScreen("dashboard");
  }

  function handleSaveQuiz(quiz: Quiz) {
    setQuizzes(qs => {
      const idx = qs.findIndex(q => q.id === quiz.id);
      if (idx >= 0) return qs.map((q, i) => i === idx ? quiz : q);
      return [...qs, quiz];
    });
    setScreen("dashboard");
    setEditingQuiz(undefined);
  }

  function handleDeleteQuiz(id: string) {
    setQuizzes(qs => qs.filter(q => q.id !== id));
  }

  function handleStartGame(quiz: Quiz, roomCode: string) {
    setGameState({ quiz, roomCode, isHost: true, playerName: user?.name ?? "Host" });
    setScreen("lobby");
  }

  function handleJoin({ code, playerName }: { code: string; playerName: string }) {
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)] ?? SAMPLE_QUIZZES[0];
    setGameState({ quiz, roomCode: code, isHost: false, playerName });
    setScreen("lobby");
  }

  function handleLobbyStart(players: Player[]) {
    setGameState(gs => ({ ...gs, players }));
    setScreen("game");
  }

  function handleGameEnd(scores: Record<string, number>) {
    setGameState(gs => ({ ...gs, finalScores: scores }));
    setScreen("results");
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {screen === "home" && (
        <HomeScreen onHost={() => setScreen("auth")} onJoin={() => setScreen("join")} />
      )}

      {screen === "auth" && (
        <AuthScreen onBack={goHome} onAuth={handleAuth} />
      )}

      {screen === "join" && (
        <JoinScreen onBack={goHome} onJoin={handleJoin} />
      )}

      {screen === "dashboard" && user && (
        <Dashboard
          user={user}
          quizzes={quizzes}
          onCreateQuiz={() => { setEditingQuiz(undefined); setScreen("quiz-editor"); }}
          onEditQuiz={q => { setEditingQuiz(q); setScreen("quiz-editor"); }}
          onDeleteQuiz={handleDeleteQuiz}
          onStartGame={handleStartGame}
          onImportQuiz={q => setQuizzes(qs => [...qs, q])}
          onBack={goHome}
        />
      )}

      {screen === "quiz-editor" && (
        <QuizEditor
          initial={editingQuiz}
          onBack={() => setScreen(user ? "dashboard" : "home")}
          onSave={handleSaveQuiz}
        />
      )}

      {screen === "lobby" && gameState.quiz && (
        <LobbyScreen
          roomCode={gameState.roomCode ?? generateRoomCode()}
          isHost={gameState.isHost ?? false}
          playerName={gameState.playerName ?? "Player"}
          quiz={gameState.quiz}
          onStart={handleLobbyStart}
          onBack={goHome}
        />
      )}

      {screen === "game" && gameState.quiz && gameState.players && (
        <GameScreen
          quiz={gameState.quiz}
          players={gameState.players}
          roomCode={gameState.roomCode ?? ""}
          isHost={gameState.isHost ?? false}
          playerName={gameState.playerName ?? "Player"}
          onEnd={handleGameEnd}
        />
      )}

      {screen === "results" && gameState.quiz && gameState.players && gameState.finalScores && (
        <ResultsScreen
          scores={gameState.finalScores}
          players={gameState.players}
          quiz={gameState.quiz}
          onReplay={() => setScreen("lobby")}
          onHome={goHome}
        />
      )}
    </>
  );
}
