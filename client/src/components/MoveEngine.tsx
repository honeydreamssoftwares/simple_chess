import  { useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import {ToastContainer } from 'react-toastify';


interface MoveEngineProps {
  onPieceDrop?: (sourceSquare: Square, targetSquare: Square) => boolean;
}


export default function MoveEngine({ onPieceDrop }: MoveEngineProps) {
  const [game] = useState(new Chess());

  /* const makeAMove = useCallback((move: { from: string; to: string; promotion?: string }|string) => {
    try {
      const result = game.move(move);
      if (!result) {
        throw new Error('Illegal move');
      }
      setGame(new Chess(game.fen())); // Properly cloning to trigger a React re-render
      return result;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message); // Displaying the error message using react-toastify
      }
      return null; // Return null if the move was illegal or an error occurred
    }
  }, [game]);
 */
  /* const makeRandomMove = useCallback(() => {
    const possibleMoves = game.moves();
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
      return; // exit if the game is over
    }
    console.log('possibleMoves',possibleMoves);
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const moveStr = possibleMoves[randomIndex];
console.log('moveStr',moveStr)
    makeAMove(moveStr);




  }, [game, makeAMove]);
 */
  /* const onDrop = useCallback((sourceSquare:Square, targetSquare:Square) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q" // Always promote to a queen for example simplicity
    };
    const result = makeAMove(move);

    if (result === null) return false; // Illegal move
    setTimeout(makeRandomMove, 200); // Delay to simulate think time
    return true;
  }, [makeAMove, makeRandomMove]);
 */

 
  return (
    <>
      <Chessboard position={game.fen()} onPieceDrop={onPieceDrop} />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

