
// src/lib/pregenerated-puzzles.ts
import type { PuzzleData, Difficulty } from '@/types';

export const PREGENERATED_PUZZLES: { [key in Difficulty]: PuzzleData[] } = {
  "easy": [
    {
      "id": 0,
      "difficulty": "easy",
      "name": "Easy Puzzle 1",
      "size": 4,
      "dots": [
        {
          "id": "yellow-0",
          "x": 0,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "green-0",
          "x": 3,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 2,
          "y": 3,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "red-0",
          "x": 1,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 0,
          "y": 3, // Corrected from y: 4
          "color": "#FF5252",
          "pairId": "red"
        }
      ]
    },
    {
      "id": 1,
      "difficulty": "easy",
      "name": "Easy Puzzle 2",
      "size": 4,
      "dots": [
        {
          "id": "yellow-0",
          "x": 0,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "green-0",
          "x": 3,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 2,
          "y": 3,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "red-0",
          "x": 1,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 0,
          "y": 3, // Corrected from y: 4
          "color": "#FF5252",
          "pairId": "red"
        }
      ]
    },
    {
      "id": 2,
      "difficulty": "easy",
      "name": "Easy Puzzle 3",
      "size": 4,
      "dots": [
        {
          "id": "yellow-0",
          "x": 0,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "red-0",
          "x": 0,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 1,
          "y": 3,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 3,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 1,
          "y": 2,
          "color": "#4CAF50",
          "pairId": "green"
        }
      ]
    },
    {
      "id": 3,
      "difficulty": "easy",
      "name": "Easy Puzzle 4",
      "size": 4,
      "dots": [
        {
          "id": "yellow-0",
          "x": 0,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "red-0",
          "x": 0,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 1,
          "y": 3,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 3,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 1,
          "y": 2,
          "color": "#4CAF50",
          "pairId": "green"
        }
      ]
    },
    {
      "id": 4,
      "difficulty": "easy",
      "name": "Easy Puzzle 5",
      "size": 4,
      "dots": [
        {
          "id": "yellow-0",
          "x": 0,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 0,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "red-0",
          "x": 0,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 2,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 3,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 2,
          "y": 3,
          "color": "#4CAF50",
          "pairId": "green"
        }
      ]
    }
  ],
  "medium": [
    {
      "id": 0, // Corrected from id: 5
      "difficulty": "medium",
      "name": "Medium Puzzle 6",
      "size": 5,
      "dots": [
        {
          "id": "purple-0",
          "x": 0,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 2,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "green-0",
          "x": 1,
          "y": 2,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 2,
          "y": 4,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "red-0",
          "x": 4,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 0,
          "y": 4, // Corrected from y: 5
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "blue-0",
          "x": 2,
          "y": 3,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 4,
          "y": 3,
          "color": "#2196F3",
          "pairId": "blue"
        }
      ]
    },
    {
      "id": 1, // Corrected from id: 6
      "difficulty": "medium",
      "name": "Medium Puzzle 7",
      "size": 5,
      "dots": [
        {
          "id": "purple-0",
          "x": 0,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 2,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "blue-0",
          "x": 4,
          "y": 1,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 3,
          "y": 4,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "red-0",
          "x": 2,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 2,
          "y": 4,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 2,
          "y": 3,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 4,
          "y": 4, // Corrected from y: 5
          "color": "#4CAF50",
          "pairId": "green"
        }
      ]
    },
    {
      "id": 2, // Corrected from id: 7
      "difficulty": "medium",
      "name": "Medium Puzzle 8",
      "size": 5,
      "dots": [
        {
          "id": "purple-0",
          "x": 0,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 2,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "red-0",
          "x": 0,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 1,
          "y": 4, // Corrected from y: 5
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 2,
          "y": 2,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 1,
          "y": 4,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "blue-0",
          "x": 2,
          "y": 3,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 2,
          "y": 4, // Corrected from y: 5
          "color": "#2196F3",
          "pairId": "blue"
        }
      ]
    },
    {
      "id": 3, // Corrected from id: 8
      "difficulty": "medium",
      "name": "Medium Puzzle 9",
      "size": 5,
      "dots": [
        {
          "id": "purple-0",
          "x": 0,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 2,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "blue-0",
          "x": 4,
          "y": 1,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 3,
          "y": 4,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "red-0",
          "x": 2,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 2,
          "y": 4,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 2,
          "y": 3,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 4,
          "y": 4, // Corrected from y: 5
          "color": "#4CAF50",
          "pairId": "green"
        }
      ]
    },
    {
      "id": 4, // Corrected from id: 9
      "difficulty": "medium",
      "name": "Medium Puzzle 10",
      "size": 5,
      "dots": [
        {
          "id": "purple-0",
          "x": 0,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 2,
          "y": 0,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "green-0",
          "x": 1,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 2,
          "y": 3,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "blue-0",
          "x": 2,
          "y": 1,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 1,
          "y": 4, // Corrected from y: 5
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "red-0",
          "x": 1,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 0,
          "y": 4, // Corrected from y: 5
          "color": "#FF5252",
          "pairId": "red"
        }
      ]
    }
  ],
  "hard": [
    {
      "id": 0, // Corrected from id: 10
      "difficulty": "hard",
      "name": "Hard Puzzle 11",
      "size": 7,
      "dots": [
        {
          "id": "pink-0",
          "x": 0,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "pink-1",
          "x": 2,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "purple-0",
          "x": 3,
          "y": 1,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 3,
          "y": 6, // Corrected from y: 7
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "green-0",
          "x": 4,
          "y": 1,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 1,
          "y": 5,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "blue-0",
          "x": 2,
          "y": 3,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 3,
          "y": 5,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "red-0",
          "x": 1,
          "y": 4,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 5,
          "y": 4,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "yellow-0",
          "x": 3,
          "y": 4,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 5,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "orange-0",
          "x": 6,
          "y": 6,
          "color": "#FF9800",
          "pairId": "orange"
        },
        {
          "id": "orange-1",
          "x": 4,
          "y": 6, // Corrected from y: 7
          "color": "#FF9800",
          "pairId": "orange"
        }
      ]
    },
    {
      "id": 1, // Corrected from id: 11
      "difficulty": "hard",
      "name": "Hard Puzzle 12",
      "size": 7,
      "dots": [
        {
          "id": "pink-0",
          "x": 0,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "pink-1",
          "x": 2,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "red-0",
          "x": 4,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 0,
          "y": 5,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "blue-0",
          "x": 5,
          "y": 1,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 1,
          "y": 2,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "yellow-0",
          "x": 3,
          "y": 3,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 5,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "purple-0",
          "x": 3,
          "y": 4,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 5,
          "y": 4,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "orange-0",
          "x": 5,
          "y": 5,
          "color": "#FF9800",
          "pairId": "orange"
        },
        {
          "id": "orange-1",
          "x": 3,
          "y": 6,
          "color": "#FF9800",
          "pairId": "orange"
        },
        {
          "id": "green-0",
          "x": 0,
          "y": 6,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 1,
          "y": 6, // Corrected from y: 7
          "color": "#4CAF50",
          "pairId": "green"
        }
      ]
    },
    {
      "id": 2, // Corrected from id: 12
      "difficulty": "hard",
      "name": "Hard Puzzle 13",
      "size": 7,
      "dots": [
        {
          "id": "pink-0",
          "x": 0,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "pink-1",
          "x": 2,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "red-0",
          "x": 0,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 1,
          "y": 6,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 1,
          "y": 2,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 3,
          "y": 4,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "blue-0",
          "x": 1,
          "y": 3,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 4,
          "y": 6,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "yellow-0",
          "x": 3,
          "y": 3,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 2,
          "y": 6, // Corrected from y: 7
          "color": "#FFC107",
          "pairId": "yellow"
        }
      ]
    },
    {
      "id": 3, // Corrected from id: 13
      "difficulty": "hard",
      "name": "Hard Puzzle 14",
      "size": 7,
      "dots": [
        {
          "id": "pink-0",
          "x": 0,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "pink-1",
          "x": 2,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "red-0",
          "x": 6,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 0,
          "y": 2,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 1,
          "y": 4,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 3,
          "y": 4,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "yellow-0",
          "x": 6,
          "y": 4,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 5,
          "y": 6,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "blue-0",
          "x": 3,
          "y": 5,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 5,
          "y": 5,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "purple-0",
          "x": 6,
          "y": 5,
          "color": "#9C27B0",
          "pairId": "purple"
        },
        {
          "id": "purple-1",
          "x": 6,
          "y": 6, // Corrected from y: 7
          "color": "#9C27B0",
          "pairId": "purple"
        }
      ]
    },
    {
      "id": 4, // Corrected from id: 14
      "difficulty": "hard",
      "name": "Hard Puzzle 15",
      "size": 7,
      "dots": [
        {
          "id": "pink-0",
          "x": 0,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "pink-1",
          "x": 2,
          "y": 0,
          "color": "#E91E63",
          "pairId": "pink"
        },
        {
          "id": "red-0",
          "x": 1,
          "y": 1,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "red-1",
          "x": 5,
          "y": 5,
          "color": "#FF5252",
          "pairId": "red"
        },
        {
          "id": "green-0",
          "x": 3,
          "y": 2,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "green-1",
          "x": 3,
          "y": 4,
          "color": "#4CAF50",
          "pairId": "green"
        },
        {
          "id": "yellow-0",
          "x": 4,
          "y": 3,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "yellow-1",
          "x": 4,
          "y": 5,
          "color": "#FFC107",
          "pairId": "yellow"
        },
        {
          "id": "blue-0",
          "x": 3,
          "y": 6,
          "color": "#2196F3",
          "pairId": "blue"
        },
        {
          "id": "blue-1",
          "x": 5,
          "y": 6, // Corrected from y: 7
          "color": "#2196F3",
          "pairId": "blue"
        }
      ]
    }
  ]
};

    