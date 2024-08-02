"use client"
import { Switch } from "antd";
import "./style.css"
import { useEffect, useRef, useState } from 'react'
import {IoMdArrowDropdown,IoMdArrowDropleft,IoMdArrowDropright,IoMdArrowDropup} from 'react-icons/io'
export default function Game(){
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameMode, setGameMode] = useState('pvc');
    const calculateWinner = (squares:any[]) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };
    const handleClick = (index:number) => {
        const newBoard = [...board];
        if (calculateWinner(board) || newBoard[index]) return;
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
        if (gameMode === 'pvc' && !isXNext) {
            const bestMove = getBestMove(newBoard);
            if (bestMove !== null) {
                newBoard[bestMove] = 'O';
                setBoard(newBoard);
                setIsXNext(true);
            }
        }
    };
    const handleReset = ()=>{
        setBoard(Array(9).fill(null))
        setIsXNext(true)
    }
    const minimax = (board:any[], depth:any, isMaximizing:any) => {
        const result = calculateWinner(board);
        if (result !== null) {
            return result === 'X' ? -10 + depth : 10 - depth;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
                    board[i] = null;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
                    board[i] = null;
                }
            }
            return bestScore;
        }
    };
    const getBestMove = (currentBoard:any) => {
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'O';
                const score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    };
    const winner = calculateWinner(board);
    const isDraw = board.every((square) => square !== null);
    let status;

    if (winner) {
        status = `Winner: ${gameMode==="pvp"?`Player ${winner === 'X' ? 1 : 2}`:`${winner === 'X' ? `Player 1` : "Computer"}`}`;
    } else if (isDraw) {
        status = 'It\'s a draw!';
    } else {
        status = `Player ${isXNext ? '1\'s' : '2\'s'} turn`;
        if (gameMode === 'pvc' && !isXNext) {
            const bestMove = getBestMove(board);
            if (bestMove !== null) {
                setTimeout(() => {
                    const newBoard = [...board];
                    newBoard[bestMove] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                }, 500); 
            }
        }
    }
   
    const renderSquare = (index:number) => (
        <button className={`cell text-white`} onClick={() => handleClick(index)}>
            {board[index]}
        </button>
    );
    useEffect(()=>{
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    },[gameMode])
    return(
        <div className="container w-[400px] h-[400px] rounded-button relative bg-gradient-to-br to-gradient-green from-gradient-blue backdrop-blur[200px] py-[15%] flex items-center gap-4">
            <div className="screws absolute w-full h-full left-0 top-0">
                <span className=" w-[10px] h-[10px] rounded-full bg-gray-600 shadow-md shadow-black absolute left-5 top-5">
                    <span className="absolute top-[50%] rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                    <span  className="absolute top-[50%] -rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                </span>
                <span className=" w-[10px] h-[10px] rounded-full bg-gray-600 shadow-md shadow-black absolute right-5 top-5">
                <span className="absolute top-[50%] rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                    <span  className="absolute top-[50%] -rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                </span>
                <span className=" w-[10px] h-[10px] rounded-full bg-gray-600 shadow-md shadow-black absolute left-5 bottom-5">
                <span className="absolute top-[50%] rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                    <span  className="absolute top-[50%] -rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                </span>
                <span className=" w-[10px] h-[10px] rounded-full bg-gray-600 shadow-md shadow-black absolute right-5 bottom-5">
                <span className="absolute top-[50%] rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                    <span  className="absolute top-[50%] -rotate-45 translate-y-[-50%] w-full h-[1px] bg-gray-100"></span>
                </span>
            </div>

            <div className="screen flex-grow flex items-center justify-center h-full bg-primary/90 rounded-button">
                <div className='board grid grid-cols-3 grid-rows-3 w-[150px] h-[150px] relative z-30'>
                {board.map((_, i) => renderSquare(i))}
                </div>
            </div>

            <div className="info flex-grow h-full max-w-[50%]">
            <div className="p-1 rounded-button bg-primary/50 w-full mb-2">
                <Switch value={gameMode==="pvc"} onClick={()=>setGameMode(gameMode==="pvc"?"pvp":"pvc")}/>
                <p>{gameMode==="pvc"?"player 1(X) vs computer(O)":"player 1(X) vs player 2(O)"}</p>
            </div>
                {/* play instructions */}
                <div className="p-1 rounded-button bg-primary/50 w-full">
                <p className="text-gray-300 lg:text-secondary text-[13px]">{"//use mouse or"}</p>
                <p className="text-gray-300 lg:text-secondary text-[13px]">{"//touchpad to play"}</p>
                {/* <div>
                    <div className="flex items-center justify-center mb-2">
                        <span className=" px-2 py-1 bg-primary text-white rounded-button flex items-center justify-center ">
                            <IoMdArrowDropup size={28}/>
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                    <span className=" px-2 py-1 bg-primary text-white rounded-button flex items-center justify-center ">
                            <IoMdArrowDropleft size={28}/>
                        </span>
                    <span className=" px-2 py-1 bg-primary text-white rounded-button flex items-center justify-center ">
                            <IoMdArrowDropdown size={28}/>
                        </span>
                    <span className=" px-2 py-1 bg-primary text-white rounded-button flex items-center justify-center ">
                            <IoMdArrowDropright size={28}/>
                        </span>
                    </div>
                </div> */}
                </div>

                {/* game data */}
                <div className="p-1 rounded-button bg-primary/50 w-full mt-2">
                    {/* <p className="text-secondary lg:text-secondary text-[13px]">{"//score: 0"}</p>
                    <p className="text-secondary lg:text-secondary text-[13px]">{"//high score: 0"}</p> */}
                    <p className="text-secondary lg:text-secondary text-[16px] font-semibold tracking-wider">{status}</p>
                </div>

                {winner||isDraw?(<button onClick={handleReset} className="bg-primary relative z-30 cursor-pointer text-secondary-white px-2 py-1 rounded-button mt-2">Reset</button>):null}
            </div>
        </div>
    )
}
