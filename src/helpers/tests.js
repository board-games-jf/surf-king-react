export const mockedEndTurnFn = jest.fn()
export default class MockedEvents {
    endTurn = () => mockedEndTurnFn()
}
