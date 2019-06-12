// @flow
import * as ACTIONS from 'constants/action_types';
import Lbry from 'lbry';
import { selectClaimsByUri } from 'redux/selectors/claims';
import { doToast } from 'redux/actions/notifications';

export function doCommentList(uri: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const claim = selectClaimsByUri(state)[uri];
    const claimId = claim ? claim.claim_id : null;

    dispatch({
      type: ACTIONS.COMMENT_LIST_STARTED,
    });
    Lbry.comment_list({
      claim_id: claimId,
    }).then(results => {
      dispatch({
        type: ACTIONS.COMMENT_LIST_COMPLETED,
        data: {
          comments: results,
          claimId: claimId,
          uri: uri,
        },
      });
    }).catch(error => {
      console.log(error);
    });
  };
}

export function doCommentCreate(
  comment: string = '',
  claim_id: string = '',
  channel_id: string,
  parent_id?: number
) {
  return (dispatch: Dispatch) => {
    dispatch({
      type: ACTIONS.COMMENT_CREATE_STARTED,
    });
    return Lbry.comment_create({
      comment,
      claim_id,
      channel_id,
    })
      .then((result: Comment) => {
        dispatch({
          type: ACTIONS.COMMENT_CREATE_COMPLETED,
          data: {
            response: result,
          },
        });
        dispatch({
          type: ACTIONS.COMMENT_LIST_UPDATED,
          data: {
            comment: result,
            claimId: claim_id,
          },
        });
      })
      .catch(error => {
        dispatch({
          type: ACTIONS.COMMENT_CREATE_FAILED,
          data: error,
        });
        dispatch(
          doToast({
            message: 'Oops, someone broke comments.',
            isError: true,
          })
        );
      });
  };
}
