import React from 'react';

function OptionsButton({ type, onEdit, onDelete }) {
  return (
    <div className="relative">
      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-md rounded-md">
        <button
          onClick={onEdit}
          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
        >
          Modifier {type === 'comment' ? 'le commentaire' : 'le post'}
        </button>
        <button
          onClick={onDelete}
          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
        >
          Supprimer {type === 'comment' ? 'le commentaire' : 'le post'}
        </button>
      </div>
    </div>
  );
}

export default OptionsButton;
