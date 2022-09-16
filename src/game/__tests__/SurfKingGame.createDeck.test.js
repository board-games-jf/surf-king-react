import { CardAmulet, CardBigWave, CardBottledWater, CardChange, CardCoconut, CardCyclone, CardEnergy, CardEnergyX2, CardEnergyX3, CardHangLoose, CardIsland, CardJumping, CardLifeGuardFloat, CardShark, CardStone, CardStorm, CardSunburn, CardSwimmingFin, CardTsunami } from '../Cards';
import { createDeck } from '../SurfKingGame';

describe('SurfKingGame createDeck', () => {
    it('happy path', () => {
        const deck = createDeck();
        
        expect(deck).toHaveLength(64);
        // Obstacles
        expect(deck.filter(card => card.Name === CardCyclone.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardIsland.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardStone.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardStorm.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardShark.Name)).toHaveLength(0);
        // Actions
        expect(deck.filter(card => card.Name === CardBigWave.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardBottledWater.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardCoconut.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardChange.Name)).toHaveLength(2);
        expect(deck.filter(card => card.Name === CardEnergy.Name)).toHaveLength(8);
        expect(deck.filter(card => card.Name === CardEnergyX2.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardEnergyX3.Name)).toHaveLength(2);
        expect(deck.filter(card => card.Name === CardHangLoose.Name)).toHaveLength(1);
        expect(deck.filter(card => card.Name === CardJumping.Name)).toHaveLength(2);
        expect(deck.filter(card => card.Name === CardLifeGuardFloat.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardSwimmingFin.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardSunburn.Name)).toHaveLength(4);
        expect(deck.filter(card => card.Name === CardTsunami.Name)).toHaveLength(4);
        // Acessories
        expect(deck.filter(card => card.Name === CardAmulet.Name)).toHaveLength(1);
    });
});