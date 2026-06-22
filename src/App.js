import React, { useState } from 'react';
import RankingTable from "./components/RankingTable";
import GameResultForm from "./components/GameResultForm";
import GameHistory from "./components/GameHistory";
import ScoreGraph from "./components/ScoreGraph";
import OpeningMovie from "./components/OpeningMovie";
import "./App.css"; // アプリ全体のスタイル

function App() {
  const [showMovie, setShowMovie] = useState(true);
  const [viewSeason, setViewSeason] = useState("2026");

  return (
    <div>
      {showMovie && <OpeningMovie onFinish={() => setShowMovie(false)} />}
      {!showMovie && (
        <div className="App">
          <h1>
            チュニジアン同好会
            <br />
            麻雀世界ランキング（FIMA）
          </h1>
          <h2>Federation of International tunisian club Mahjong Associations</h2>

          <div className="season-tabs">
            <button onClick={() => setViewSeason("2026")} className={viewSeason === "2026" ? "active" : ""}>Season2 (2026/05/10 ~)</button>
            <button onClick={() => setViewSeason("2025")} className={viewSeason === "2025" ? "active" : ""}>Season1 (~ 2026/05/09)</button>
          </div>

          {/* 順位表 */}
          <RankingTable season={viewSeason} />

          <hr />

          {/* 対局履歴 */}
          <GameHistory season={viewSeason} />

          <hr />

          {/* スコアグラフ */}
          <ScoreGraph season={viewSeason} />

          <hr />

          {/* 戦績入力フォーム */}
          <GameResultForm />
        </div>
      )}
    </div>
  );
}

export default App;
