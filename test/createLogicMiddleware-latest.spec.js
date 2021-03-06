import Rx from 'rxjs';
import expect from 'expect';
import { createLogic, createLogicMiddleware } from '../src/index';

describe('createLogicMiddleware-latest', () => {
  describe('[logicA] latest=falsey validate async allow', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    beforeEach(done => {
      next = expect.createSpy().andCall(nextCb);
      let nextCount = 0;
      function nextCb() {
        if (++nextCount >= 2) { done(); }
      }
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 0) { done(); }
      }
      logicA = createLogic({
        type: 'FOO',
        validate({ action }, allow) {
          setTimeout(() => {
            allow(action);
          }, 0);
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      storeFn(actionFoo2);
    });

    it('passes both actionFoo1 and actionFoo2', () => {
      expect(next.calls.length).toBe(2);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo1);
      expect(next.calls[1].arguments[0]).toEqual(actionFoo2);
    });

    it('no dispatches', () => {
      expect(dispatch.calls.length).toBe(0);
    });
  });

  describe('[logicA] latest=falsey process', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    const actionResultFoo1 = { type: 'BAR', id: 1 };
    const actionResultFoo2 = { type: 'BAR', id: 2 };
    beforeEach(done => {
      next = expect.createSpy();
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 2) { done(); }
      }
      logicA = createLogic({
        type: 'FOO',
        process({ action }, dispatch) {
          setTimeout(() => {
            dispatch({
              ...action,
              type: 'BAR'
            });
          }, 0);
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      storeFn(actionFoo2);
    });

    it('passes both actionFoo1 and actionFoo2', () => {
      expect(next.calls.length).toBe(2);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo1);
      expect(next.calls[1].arguments[0]).toEqual(actionFoo2);
    });

    it('dispatch actionResult1 and actionResult2', () => {
      expect(dispatch.calls.length).toBe(2);
      expect(dispatch.calls[0].arguments[0]).toEqual(actionResultFoo1);
      expect(dispatch.calls[1].arguments[0]).toEqual(actionResultFoo2);
    });
  });

  describe('[logicA] latest validate async allow', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    beforeEach(done => {
      next = expect.createSpy().andCall(() => done());
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 0) {
          done();
        }
      }
      logicA = createLogic({
        type: 'FOO',
        latest: true,
        validate({ action }, allow) {
          setTimeout(() => {
            allow(action);
          }, 0);
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      storeFn(actionFoo2);
    });

    it('take only latest, passes only actionFoo2 since validate async', () => {
      expect(next.calls.length).toBe(1);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo2);
    });

    it('no dispatches', () => {
      expect(dispatch.calls.length).toBe(0);
    });
  });

  describe('[logicA] latest validate async reject', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    beforeEach(done => {
      next = expect.createSpy().andCall(() => done());
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 0) {
          done();
        }
      }
      logicA = createLogic({
        type: 'FOO',
        latest: true,
        validate({ action }, allow, reject) {
          setTimeout(() => {
            reject(action);
          }, 0);
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      storeFn(actionFoo2);
    });

    it('take only latest, passes only actionFoo2 since validate async', () => {
      expect(next.calls.length).toBe(1);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo2);
    });

    it('no dispatches', () => {
      expect(dispatch.calls.length).toBe(0);
    });
  });

  describe('[logicA] latest next async', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    const actionResult = { type: 'FOO', id: 2, trans: ['a'] };
    beforeEach(done => {
      next = expect.createSpy().andCall(() => done());
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 0) {
          done();
        }
      }
      logicA = createLogic({
        type: 'FOO',
        latest: true,
        transform({ action }, next) {
          setTimeout(() => {
            next({
              ...action,
              trans: ['a']
            });
          }, 0);
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      storeFn(actionFoo2);
    });

    it('take only latest, passes only actionFoo2 since validate async', () => {
      expect(next.calls.length).toBe(1);
      expect(next.calls[0].arguments[0]).toEqual(actionResult);
    });

    it('no dispatches', () => {
      expect(dispatch.calls.length).toBe(0);
    });
  });

  describe('[logicA] latest process', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    const actionResultFoo2 = { type: 'BAR', id: 2 };
    beforeEach(done => {
      next = expect.createSpy().andCall(() => cb({ next: true }));
      dispatch = expect.createSpy().andCall(() => cb({ dispatch: true }));
      let nextCount = 0;
      let dispatchCount = 0;
      function cb(obj) {
        if (obj.next) { nextCount++; }
        if (obj.dispatch) { dispatchCount++; }
        if (nextCount >= 2 && dispatchCount >= 1) {
          done();
        }
      }
      logicA = createLogic({
        type: 'FOO',
        latest: true,
        process({ action }, dispatch) {
          setTimeout(() => {
            dispatch({
              ...action,
              type: 'BAR'
            });
          }, 100); // needs to be delayed so we can check next calls
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      setTimeout(() => {
        storeFn(actionFoo2);
      }, 0);
    });

    it('passes both actionFoo1 and actionFoo2', () => {
      expect(next.calls.length).toBe(2);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo1);
      expect(next.calls[1].arguments[0]).toEqual(actionFoo2);
    });

    it('dispatch only actionResult2', () => {
      expect(dispatch.calls.length).toBe(1);
      expect(dispatch.calls[0].arguments[0]).toEqual(actionResultFoo2);
    });
  });

  describe('[logicA] latest process syncDispatch(x, true) dispatch(y)', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    const actionSyncResult1 = { type: 'BAR', id: 1 };
    const actionSyncResult2 = { type: 'BAR', id: 2 };
    const actionResultFoo2 = { type: 'CAT', id: 2 };
    beforeEach(done => {
      next = expect.createSpy();
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 3) { done(); }
      }
      logicA = createLogic({
        type: 'FOO',
        latest: true,
        process({ action }, dispatch) {
          // immediate dispatch
          dispatch({
            ...action,
            type: 'BAR'
          }, { allowMore: true });

          // followed by later async dispatch
          setTimeout(() => {
            dispatch({
              ...action,
              type: 'CAT'
            });
          }, 20);
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      setTimeout(() => {
        storeFn(actionFoo2);
      }, 10);
    });

    it('passes both actionFoo1 and actionFoo2', () => {
      expect(next.calls.length).toBe(2);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo1);
      expect(next.calls[1].arguments[0]).toEqual(actionFoo2);
    });

    it('dispatch only sync1, sync2, async2', () => {
      expect(dispatch.calls.length).toBe(3);
      expect(dispatch.calls[0].arguments[0]).toEqual(actionSyncResult1);
      expect(dispatch.calls[1].arguments[0]).toEqual(actionSyncResult2);
      expect(dispatch.calls[2].arguments[0]).toEqual(actionResultFoo2);
    });
  });

  describe('[logicA] latest process obs(sync x, async y)', () => {
    let mw;
    let logicA;
    let next;
    let dispatch;
    const actionFoo1 = { type: 'FOO', id: 1 };
    const actionFoo2 = { type: 'FOO', id: 2 };
    const actionSyncResult1 = { type: 'BAR', id: 1 };
    const actionSyncResult2 = { type: 'BAR', id: 2 };
    const actionResultFoo2 = { type: 'CAT', id: 2 };
    beforeEach(done => {
      next = expect.createSpy();
      dispatch = expect.createSpy().andCall(cb);
      let dispatchCount = 0;
      function cb() {
        if (++dispatchCount >= 3) { done(); }
      }
      logicA = createLogic({
        type: 'FOO',
        latest: true,
        process({ action }, dispatch) {
          dispatch(Rx.Observable.create(obs => {
            // immediate dispatch
            obs.next({
              ...action,
              type: 'BAR'
            });

            // followed by later async dispatch
            setTimeout(() => {
              obs.next({
                ...action,
                type: 'CAT'
              });
            }, 10);
          }));
        }
      });
      mw = createLogicMiddleware([logicA]);
      const storeFn = mw({ dispatch })(next);
      storeFn(actionFoo1);
      setTimeout(() => {
        storeFn(actionFoo2);
      }, 10);
    });

    it('passes both actionFoo1 and actionFoo2', () => {
      expect(next.calls.length).toBe(2);
      expect(next.calls[0].arguments[0]).toEqual(actionFoo1);
      expect(next.calls[1].arguments[0]).toEqual(actionFoo2);
    });

    it('dispatch only sync1, sync2, async2', () => {
      expect(dispatch.calls.length).toBe(3);
      expect(dispatch.calls[0].arguments[0]).toEqual(actionSyncResult1);
      expect(dispatch.calls[1].arguments[0]).toEqual(actionSyncResult2);
      expect(dispatch.calls[2].arguments[0]).toEqual(actionResultFoo2);
    });
  });
});
