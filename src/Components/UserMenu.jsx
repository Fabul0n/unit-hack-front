import { useState } from "react";
import { MainMenu } from "./vagonGame/MainMenu";
import { EggDropGame } from "./EggGame/EggDropGame";
import { RookVsBishopGame } from "./ChessGame/RookVsBishopGame";
import { MoonStoneGame } from "./StoneGame/MoonStoneGame";
import { Prize } from "./Prize/Prize";
import { useAppContext } from "../Context/AppContext";
import { motion } from "framer-motion";

const calculateScore = (gameId, attempts, win) => {
  if (!win) return 0;
  if (gameId === 0) {
    if (attempts <= 6) return 500;
    const score = 500 - (attempts - 6) * 50;
    return Math.max(score, 0);
  } else if (gameId === 1) {
    if (attempts <= 14) return 500;
    const score = 500 - (attempts - 14) * 20;
    return Math.max(score, 0);
  } else if (gameId === 2) {
    if (attempts <= 6) return 500;
    const score = 500 - (attempts - 6) * 25;
    return Math.max(score, 0);
  } else if (gameId === 3) {
    return attempts; // Points for stones game (100, 200, 300)
  }
  return 0;
};

const getGameName = { 0: "train", 1: "eggs", 2: "chess", 3: "stones" };

export const UserMenu = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameScores, setGameScores] = useState({});
  const [chosenGame, setChosenGame] = useState(null);
  const [totalSeats, setTotalSeats] = useState(54);
  const [isWin, setIsWin] = useState(false);
  const [score, setScore] = useState(0);
  const [showPrize, setShowPrize] = useState(false);
  const { userId, nickname, userPlayed, updateUserPlayed } = useAppContext();

  const games = [
    { name: "Плацкартный вагон", id: 0 },
    { name: "Яички", id: 1 },
    { name: "Ладья против Слона", id: 2 },
    { name: "Камешки", id: 3 },
  ];

  const startGame = (gameId) => {
    setChosenGame(gameId);
    setIsGameStarted(true);
    setIsGameOver(false);
    setIsWin(false);
    setScore(0);
    setFinalScore(0);
    setShowPrize(false);
  };

  const restartGame = () => {
    if (isWin && finalScore > 0) {
      setGameScores((prev) => ({
        ...prev,
        [getGameName[chosenGame]]: {
          max: Math.max(finalScore, prev?.[getGameName[chosenGame]]?.max || 0),
          prev: finalScore,
        },
      }));
    }
    setIsGameStarted(true);
    setIsGameOver(false);
    setIsWin(false);
    setScore(0);
    setFinalScore(0);
    setShowPrize(false);
  };

  const goToMenu = () => {
    if (isWin && finalScore > 0) {
      setGameScores((prev) => ({
        ...prev,
        [getGameName[chosenGame]]: {
          max: Math.max(finalScore, prev?.[getGameName[chosenGame]]?.max || 0),
          prev: finalScore,
        },
      }));
    }
    setIsGameStarted(false);
    setIsGameOver(false);
    setIsWin(false);
    setScore(0);
    setFinalScore(0);
    setChosenGame(null);
    setShowPrize(false);
  };

  const handleGameOver = (win, attempts, gameId) => {
    setIsWin(win);
    setIsGameOver(true);
    const calculatedScore = calculateScore(gameId, attempts, win);
    setFinalScore(calculatedScore);
    console.log("calculatedScore", calculatedScore);
    if (win && calculatedScore > 0) {
      setGameScores((prev) => ({
        ...prev,
        [getGameName[gameId]]: {
          max: Math.max(calculatedScore, prev?.[getGameName[gameId]]?.max || 0),
          prev: calculatedScore,
        },
      }));
    }

    // Increment userPlayed for the game
    updateUserPlayed(gameId);

    // API call for score
    const req = async () => {
      try {
        const response = await fetch("http://5.35.80.93:8000/result", {
          method: "POST",
          body: JSON.stringify({
            userId,
            nickname,
            score: calculatedScore,
            gameId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("API POST error");
        }
        const result = await response.json();
        console.log("API response:", result);
      } catch (e) {
        console.error("API error:", e);
      }
    };
    req();
  };

  const totalScore = Object.values(gameScores).reduce(
    (sum, game) => sum + (game?.max || 0),
    0
  );

  return (
    <div className="min-h-screen lunar-bg">
      {!isGameStarted && !isGameOver && !showPrize && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 max-w-lg mx-auto"
        >
          <div className="card">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-200">
              Космические Игры
            </h1>
            <div className="mb-6 text-lg text-center text-gray-300">
              Пользователь: <span className="font-semibold">{nickname}</span>
            </div>
            {totalScore > 0 && (
              <div className="mb-6 text-lg text-center text-yellow-400">
                Общий счёт: <span className="font-semibold">{totalScore}</span>
              </div>
            )}
            {games.map((game) => (
              <motion.div
                key={game.id}
                className="mb-8"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card">
                  <h2 className="text-xl font-semibold text-indigo-300 mb-2">
                    {game.name}
                  </h2>
                  {gameScores.hasOwnProperty(getGameName[game.id]) && (
                    <div className="text-gray-300">
                      Лучший счёт: {gameScores[getGameName[game.id]].max}
                    </div>
                  )}
                  <div className="text-gray-300 mb-2">
                    Сыграно: {userPlayed[game.id] || 0}/3
                  </div>
                  {userPlayed[game.id] < 3 ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary btn-blue"
                      onClick={() => startGame(game.id)}
                      aria-label={`Начать игру ${game.name}`}
                    >
                      Начать
                    </motion.button>
                  ) : (
                    <p className="text-red-400 font-medium">Попытки исчерпаны</p>
                  )}
                </div>
              </motion.div>
            ))}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary btn-purple mt-4 w-full"
              onClick={() => setShowPrize(true)}
              aria-label="Посмотреть приз"
            >
              Посмотреть приз
            </motion.button>
          </div>
        </motion.div>
      )}

      {chosenGame === 0 && (
        <MainMenu
          gameScores={gameScores}
          score={score}
          setScore={setScore}
          finalScore={finalScore}
          setFinalScore={setFinalScore}
          startGame={startGame}
          restartGame={restartGame}
          goToMenu={goToMenu}
          handleGameOver={(win, score) => handleGameOver(win, score, 0)}
          isGameOver={isGameOver}
          isGameStarted={isGameStarted}
          totalSeats={totalSeats}
          isWin={isWin}
          userPlayed={userPlayed}
        />
      )}

      {chosenGame === 1 && (
        <EggDropGame
          gameScores={gameScores}
          score={score}
          setScore={setScore}
          finalScore={finalScore}
          setFinalScore={setFinalScore}
          startGame={startGame}
          restartGame={restartGame}
          goToMenu={goToMenu}
          handleGameOver={(win, score) => handleGameOver(win, score, 1)}
          isGameOver={isGameOver}
          isGameStarted={isGameStarted}
          userPlayed={userPlayed}
        />
      )}

      {chosenGame === 2 && (
        <RookVsBishopGame
          gameScores={gameScores}
          score={score}
          setScore={setScore}
          finalScore={finalScore}
          setFinalScore={setFinalScore}
          startGame={startGame}
          restartGame={restartGame}
          goToMenu={goToMenu}
          handleGameOver={(win, score) => handleGameOver(win, score, 2)}
          isGameOver={isGameOver}
          isGameStarted={isGameStarted}
          userPlayed={userPlayed}
        />
      )}

      {chosenGame === 3 && (
        <MoonStoneGame
          gameScores={gameScores}
          score={score}
          setScore={setScore}
          finalScore={finalScore}
          setFinalScore={setFinalScore}
          startGame={startGame}
          restartGame={restartGame}
          goToMenu={goToMenu}
          handleGameOver={(win, score) => handleGameOver(win, score, 3)}
          isGameOver={isGameOver}
          isGameStarted={isGameStarted}
          userPlayed={userPlayed}
        />
      )}

      {showPrize && <Prize goToMenu={goToMenu} totalScore={totalScore} />}
    </div>
  );
};