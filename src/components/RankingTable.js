import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import "./RankingTable.css"; // 作成したCSSをインポート

const RankingTable = ({ season }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    // 3. クエリを「games」コレクションから指定シーズンのものを取得するように変更
    const q = query(
      collection(db, "games"), 
      where("season", "==", season),
      orderBy("gameDate", "desc"),
      orderBy("createdAt", "desc") // 追加：同じ月内でも作成順に並べる
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const stats = {};

      // 4. 取得した対局データから、プレイヤーごとの成績をその場で計算
      querySnapshot.forEach((doc) => {
        const game = doc.data();
        game.results.forEach((res) => {
          if (!stats[res.playerId]) {
            stats[res.playerId] = { 
              id: res.playerId, 
              name: res.name, 
              totalScore: 0, 
              gameCount: 0, 
              averageRank: 0, 
              rankCounts: { "1st": 0, "2nd": 0, "3rd": 0, "4th": 0, "5th": 0 } 
            };
          }
          const p = stats[res.playerId];
          p.totalScore += res.score;
          p.gameCount += 1;
          p.averageRank += res.rank;
          const rankKey = res.rank === 1 ? "1st" : res.rank === 2 ? "2nd" : res.rank === 3 ? "3rd" : res.rank === 4 ? "4th" : "5th";
          p.rankCounts[rankKey] += 1;
        });
      });

      // 配列に変換してスコア順にソート
      const playersData = Object.values(stats).map(p => ({
        ...p,
        averageRank: p.averageRank / p.gameCount
      })).sort((a, b) => b.totalScore - a.totalScore);

      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [season]);

  if (loading) {
    return (
      <div className="ranking-container">
        <p style={{ textAlign: "center" }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <h2 className="ranking-title">総合順位表</h2>
      {/* テーブルが横にはみ出た場合にスクロールできるようにするdivラッパー */}
      <div style={{ overflowX: "auto" }}>

        <table className="styled-table">
          <thead>
            <tr>
              <th>順位</th>
              <th>名前</th>
              <th>Total</th>
              <th>対局数</th>
              <th>平均順位</th>
              <th>1着</th>
              <th>2着</th>
              <th>3着</th>
              <th>4着</th>
              <th>5着</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.id}>
                <td>
                  {/* 1~3位に特別な色をつけるロジック */}
                  <span className={index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : ""}>{index + 1}</span>
                </td>
                <td style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{player.name}</td>
                {/* スコアがプラスなら青、マイナスなら赤にする処理 */}
                <td style={{ color: player.totalScore >= 0 ? "blue" : "red", fontWeight: "bold" }}>
                  {player.totalScore > 0 ? `+${player.totalScore}` : player.totalScore}
                </td>
                <td>{player.gameCount}</td>
                <td>{player.averageRank ? player.averageRank.toFixed(2) : "-"}</td>
                <td>{player.rankCounts["1st"] || 0}</td>
                <td>{player.rankCounts["2nd"] || 0}</td>
                <td>{player.rankCounts["3rd"] || 0}</td>
                <td>{player.rankCounts["4th"] || 0}</td>
                <td>{player.rankCounts["5th"] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- ↓↓ 修正箇所 ↓↓ --- */}
      </div>{" "}
      {/* スクロール用divの閉じタグ */}
      {/* --- ↑↑ 修正箇所 ↑↑ --- */}
    </div>
  );
};

export default RankingTable;
