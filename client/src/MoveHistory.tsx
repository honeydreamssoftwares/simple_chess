
interface MoveHistoryProps {
    moves: string[]; 
}

function MoveHistory({ moves }: MoveHistoryProps) {
    return (
        <div className="move-history-container">
            <h2>Move History</h2>
            <ul className="move-list">
                {moves.map((move, index) => (
                    <li key={index} className="move-item">
                        {index + 1}. {move}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MoveHistory;
