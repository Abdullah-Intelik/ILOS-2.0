// components/forms/CreditCardRewardProgramForm.tsx
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardRewardProgramForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const creditCard = customerData?.creditCard || {};

  const handleChange = (value: string) => {
    updateCustomerData({
      creditCard: {
        ...creditCard,
        rewardProgram: value
      }
    });
  };

  // Determine if field is pre-filled for highlighting
  const isPreFilled = (value?: string) => {
    return !!creditCard.rewardProgram && creditCard.rewardProgram === value;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">2. Reward Program (only for PSO/Galleria)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <label className={`flex items-center gap-2 ${isPreFilled('PSO RoadMiles') ? 'bg-green-50 p-1 rounded' : ''}`}>
          <input 
            type="radio" 
            name="Reward" 
            value="PSO RoadMiles"
            checked={creditCard.rewardProgram === 'PSO RoadMiles'}
            onChange={(e) => handleChange(e.target.value)}
          /> PSO RoadMiles
        </label>
        <label className={`flex items-center gap-2 ${isPreFilled('Classic Rewards') ? 'bg-green-50 p-1 rounded' : ''}`}>
          <input 
            type="radio" 
            name="Reward" 
            value="Classic Rewards"
            checked={creditCard.rewardProgram === 'Classic Rewards'}
            onChange={(e) => handleChange(e.target.value)}
          /> Classic Rewards
        </label>
      </div>
    </section>
  );
};
