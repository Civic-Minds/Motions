import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';

export const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
    const ward = TORONTO_WARDS.find(w => w.id === wardId);
    if (ward) COUNCILLOR_WARD[name] = { id: wardId, name: ward.name };
});
