import React from 'react'
/**
 * @param {number} fromX
 */
function Arrow({ fromX, fromY, toX, toY}: { fromX: number, fromY: number, toX: number, toY: number }) {


    return (
        <svg style={{ position: 'absolute', left: 0, top: 0 }}>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                    refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="red" />
                </marker>
            </defs>
            <line x1={fromX} y1={fromY} x2={toX} y2={toY} stroke="red" markerEnd="url(#arrowhead)" />
        </svg>
    );
}

export default Arrow;
