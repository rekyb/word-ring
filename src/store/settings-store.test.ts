import { useSettingsStore } from './settings-store';

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ soundOn: true, hapticsOn: true });
  });

  it('starts with sound and haptics on', () => {
    expect(useSettingsStore.getState().soundOn).toBe(true);
    expect(useSettingsStore.getState().hapticsOn).toBe(true);
  });

  it('toggles sound', () => {
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundOn).toBe(false);
  });

  it('toggles haptics', () => {
    useSettingsStore.getState().toggleHaptics();
    expect(useSettingsStore.getState().hapticsOn).toBe(false);
  });
});
