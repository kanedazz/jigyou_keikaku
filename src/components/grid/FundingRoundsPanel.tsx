import { useModelCalculation } from "../../hooks/useModelCalculation";
import { useProjectStore } from "../../store/useProjectStore";
import { formatYen } from "../../utils/format";
import "./FundingRoundsPanel.css";

export function FundingRoundsPanel() {
  const { assumptions } = useModelCalculation();
  const addFundingRound = useProjectStore((s) => s.addFundingRound);
  const updateFundingRound = useProjectStore((s) => s.updateFundingRound);
  const removeFundingRound = useProjectStore((s) => s.removeFundingRound);

  return (
    <div className="funding-panel">
      <h3>調達ラウンド</h3>
      <table>
        <thead>
          <tr>
            <th>ラウンド名</th>
            <th>実施月（何ヶ月目）</th>
            <th>調達額（円）</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assumptions.fundingRounds.map((round) => (
            <tr key={round.id}>
              <td>
                <input
                  value={round.label}
                  onChange={(e) => updateFundingRound(round.id, { label: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={round.monthIndex}
                  onChange={(e) =>
                    updateFundingRound(round.id, { monthIndex: Number(e.target.value) })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={round.amount}
                  onChange={(e) => updateFundingRound(round.id, { amount: Number(e.target.value) })}
                />
                <span className="hint">{formatYen(round.amount)}円</span>
              </td>
              <td>
                <button className="btn-icon-small danger" onClick={() => removeFundingRound(round.id)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn-add"
        onClick={() => addFundingRound({ label: "新規ラウンド", monthIndex: 0, amount: 0 })}
      >
        + ラウンドを追加
      </button>
    </div>
  );
}
