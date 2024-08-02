"use client"
import React, { useState, useEffect, useCallback } from 'react';
import './style.css'
const ExampleGame = () => {
  // Constants
  const fps = 1000 / 30;
  const rotateSpd = 4;
  const fireInterval = 300;
  const fireSpd = 0.15;
  const spdPerSummon = 250;
  const minSummonSpd = 500;
  const zombieSpd = 0.025;
  const zombieDelay = 2000;
  const lifeCount = 3;
  const center = { x: 4, y: 4 };
  const screen = { width: 8, height: 8 };
  const turret = { width: 0.8, height: 0.8 };
  const fire = { width: 0.25, height: 0.25 };
  const zombie:any = { width: 0.65, height: 1.2 };
  const noSummonArea = { x1: 2, x2: 7, y1: 2, y2: 7 };

  // State variables
  const [state, setState] = useState({
    time: performance.now(),
    holdLeft: false,
    holdRight: false,
    rotation: 0,
    lastFire: 0,
    summonSpd: 5000,
    summonTime: 0,
    turret: [],
    fires: [],
    zombies: [],
    life: lifeCount,
    score: 0,
    pause: true,
    showTitle: true,
    showTryAgain: false,
    debugText: '',
  });

  const setGameState = (newState:any) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  // Event handlers
  useEffect(() => {
    const handleKeyDown = (evt:any) => {
      if (state.pause) return;

      if (evt.keyCode === 32) {
        if (
          state.lastFire === 0 ||
          (performance.now() - state.lastFire > fireInterval && state.fires.length < 2)
        ) {
          setGameState({ lastFire: performance.now() });
          throwFire();
        }
      } else if (evt.keyCode === 37) {
        setGameState({ holdLeft: true });
      } else if (evt.keyCode === 39) {
        setGameState({ holdRight: true });
      }
    };

    const handleKeyUp = (evt:any) => {
      if (evt.keyCode === 32 || evt.keyCode === 13) {
        if (state.showTitle) {
          if (!state.showTryAgain) {
            setGameState({ showTitle: false, pause: false });
            animate();
          } else {
            restartGame();
            setGameState({ showTryAgain: false });
          }
        }
      } else if (evt.keyCode === 37) {
        if (state.pause) return;
        setGameState({ holdLeft: false });
      } else if (evt.keyCode === 39) {
        if (state.pause) return;
        setGameState({ holdRight: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initialize turret's position
    setGameState({ turret: [{ x: center.x - turret.width / 2, y: center.y - turret.height / 2 }] });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state]);

  const remVal = (value:any) => `${value}rem`;

  const randomNum = (value:any) => Math.floor(Math.random() * Math.floor(value));

  const throwFire = () => {
    let tmpFire = state.fires;
    let angle = (state.rotation - 90) * Math.PI / 180;
    let half = { w: fire.width / 2, h: fire.height / 2 };

    (tmpFire as any).push({
      a: angle,
      x: center.x - half.w + Math.cos(angle),
      y: center.y - half.h + Math.sin(angle),
    });

    setGameState({ fires: tmpFire });
  };

  const summonZombieTrigger = () => {
    if (state.summonTime > state.summonSpd) {
      summonZombie();
      let nextSummonSpd = state.summonSpd > minSummonSpd ? state.summonSpd - 100 : minSummonSpd;
      setGameState({ summonTime: 0, summonSpd: nextSummonSpd });
    } else {
      setGameState({ summonTime: state.summonTime + fps });
    }
  };

  const summonZombie = () => {
    let tmpZombie = state.zombies;
    let half = { width: zombie.width / 2, height: zombie.height / 2 };
    let random = {
      x: randomNum(screen.width * 100) / 100 - half.width,
      y: randomNum(screen.height * 100) / 100 - half.height,
    };
    let addClass = random.x > center.x ? 'flip' : '';
    let angle = 0;

    if (
      random.x > noSummonArea.x1 &&
      random.x < noSummonArea.x2 &&
      random.y > noSummonArea.y1 &&
      random.y < noSummonArea.y2
    ) {
      summonZombie();
      return false;
    }

    let a = center.y - random.y;
    let b = center.x - random.x;
    angle = Math.atan2(a, b);

    (tmpZombie as any).push({
      a: angle,
      x: random.x,
      y: random.y,
      c: addClass,
      d: performance.now(),
      s: false,
    });

    setGameState({ zombies: tmpZombie });
  };

  const restartGame = () => {
    setGameState({
      time: performance.now(),
      holdLeft: false,
      holdRight: false,
      rotation: 0,
      lastFire: 0,
      summonSpd: 5000,
      summonTime: 0,
      fires: [],
      zombies: [],
      life: lifeCount,
      score: 0,
      pause: true,
      showTitle: true,
      showTryAgain: false,
    });
  };

  const edgeCollision = (i:any, arr:any, width:any, height:any) => {
    let tmpArr = [...arr];
    let tmpObj = tmpArr[i];

    if (
      tmpObj.x + width < 0 ||
      tmpObj.y + height < 0 ||
      tmpObj.x > screen.width ||
      tmpObj.y > screen.height
    ) {
      tmpArr.splice(i, 1);
    }

    return tmpArr;
  };

  const objectCollision = (i:any, arr1:any, width1:any, height1:any, arr2:any, width2:any, height2:any, callback:any) => {
    let tmpArr1 = [...arr1];
    let tmpArr2 = [...arr2];
    let tmpObj1 = tmpArr1[i];

    for (let j = 0; j < tmpArr2.length; j++) {
      let tmpObj2 = tmpArr2[j];

      if (
        typeof tmpObj1 !== 'undefined' &&
        tmpObj1.x + width1 > tmpObj2.x &&
        tmpObj1.x < tmpObj2.x + width2 &&
        tmpObj1.y + width1 > tmpObj2.y &&
        tmpObj1.y < tmpObj2.y + width2
      ) {
        callback(i, j, tmpArr1, tmpArr2);
        break;
      }
    }

    return { fire: tmpArr1, zombie: tmpArr2 };
  };

  const fireCollision = (i:any) => {
    let tmpArr = edgeCollision(i, state.fires, fire.width, fire.height);
    let objArr = objectCollision(
      i,
      state.fires,
      fire.width,
      fire.height,
      state.zombies,
      zombie.width,
      zombie.height,
      (i:any, j:any, tmpArr1:any, tmpArr2:any) => {
        tmpArr1.splice(i, 1);
        let zombies = state.zombies;

        if (!(zombies as any)[j].s) {
          setGameState({ score: state.score + 1 });
        }

        (zombies as any)[j].c += ' zombie-dying';
        (zombies as any)[j].s = true;
        setGameState({ zombies });
      }
    );

    tmpArr = objArr.fire;
    setGameState({ zombie: objArr.zombie });
    return tmpArr;
  };

  const zombieCollision = (i:any) => {
    let tmpZombie = edgeCollision(i, state.zombies, zombie.width, zombie.height);
    let objArr = objectCollision(
      i,
      state.zombies,
      zombie.width,
      zombie.height,
      state.turret,
      turret.width,
      turret.height,
      (i:any, j:any, tmpArr1:any, tmpArr2:any) => {
        let zombies = (state as any).zombies;

        if (zombies[i].c.indexOf('zombie-hiding') < 0) {
          zombies[i].c = zombies[i].c.replace(/zombie-walking/g, 'zombie-hiding');
          zombies[i].s = true;

          setGameState({ zombies, life: state.life - 1 });
        }

        if (state.life === 0) {
          setGameState({ pause: true });

          setTimeout(() => {
            setGameState({ showTryAgain: true });
          }, 1500);
        }
      }
    );

    tmpZombie = objArr.fire;
    setGameState({ zombie: objArr.zombie });

    return tmpZombie;
  };

  const animate = useCallback(() => {
    const currentTime = performance.now();

    if (state.holdLeft) {
      setGameState({ rotation: state.rotation - rotateSpd });
    } else if (state.holdRight) {
      setGameState({ rotation: state.rotation + rotateSpd });
    }

    summonZombieTrigger();

    let tmpFires = (state as any).fires;
    for (let i = 0; i < tmpFires.length; i++) {
      tmpFires[i].x += Math.cos(tmpFires[i].a) * fireSpd;
      tmpFires[i].y += Math.sin(tmpFires[i].a) * fireSpd;
      tmpFires = fireCollision(i);
    }

    setGameState({ fires: tmpFires });

    let tmpZombies = (state as any).zombies;
    for (let i = 0; i < tmpZombies.length; i++) {
      if (!tmpZombies[i].s) {
        tmpZombies[i].x += Math.cos(tmpZombies[i].a) * zombieSpd;
        tmpZombies[i].y += Math.sin(tmpZombies[i].a) * zombieSpd;
      }

      (tmpZombies as any) = zombieCollision(i);
    }

    setGameState({ zombies: tmpZombies });

    setTimeout(() => {
      if (!state.pause) {
        requestAnimationFrame(animate);
      }
    }, fps);
  }, [state]);

  useEffect(() => {
    if (!state.pause) {
      animate();
    }
  }, [state.pause, animate]);

  return (
    <div className="game-container">
      {state.showTitle && <div className="title-screen">Press Enter to Start</div>}
      {state.showTryAgain && <div className="try-again-screen">Game Over. Press Enter to Try Again</div>}
      {/* Game elements go here */}
      <div className="turret" style={{ transform: `rotate(${state.rotation}deg)` }}></div>
      {state.fires.map((fire:any, index) => (
        <div key={index} className="fire" style={{ left: remVal(fire.x), top: remVal(fire.y) }}></div>
      ))}
      {state.zombies.map((zombie:any, index) => (
        <div key={index} className={`zombie ${zombie.c}`} style={{ left: remVal(zombie.x), top: remVal((zombie as any).y) }}></div>
      ))}
      <div className="score">Score: {state.score}</div>
      <div className="lives">Lives: {state.life}</div>
    </div>
  );
};

export default ExampleGame;
