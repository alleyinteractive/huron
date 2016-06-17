import { combineReducers } from 'redux';

const initialState = {
  sections: [],
};

export default function huronReducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_SECTION':
      return Object.assign({}, state, {
        sections: state.sections.concat(action.section.data)
      });

    case 'REMOVE_SECTION':
      return Object.assign({}, state, {
        sections: state.sections.filter(curr => {
          return action.section.data !== curr.data
        })
      });

    case 'UPDATE_SECTION':
      return state;

    default:
      return state;
  }
}

// function sections(state = [], action) {
//   switch (action.type) {
//     case 'ADD_SECTION':
//       return state;

//     case 'REMOVE_SECTION':
//       return state;

//     case 'UPDATE_SECTION':
//       return state;

//     default:
//       return stat;
//   }
// }