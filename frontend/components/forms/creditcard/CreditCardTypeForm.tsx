// components/forms/CreditCardTypeForm.tsx
import { useCustomer } from "@/contexts/CustomerContext";

export const CreditCardTypeForm = () => {
  const { customerData, updateCustomerData } = useCustomer();
  const creditCard = customerData?.creditCard || {};

  const handleChange = (field: string, value: string) => {
    updateCustomerData({
      creditCard: {
        ...creditCard,
        [field]: value
      }
    });
  };

  // Determine if field is pre-filled for highlighting
  const isPreFilled = (field: string, value?: string) => {
    return !!creditCard[field as keyof typeof creditCard] && creditCard[field as keyof typeof creditCard] === value;
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">1. Choose Your Card Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Card Type</label>
          <div className="flex flex-col gap-2">
            <label className={`flex items-center gap-2 ${isPreFilled('cardType', 'Gold') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="cardType" 
                value="Gold"
                checked={creditCard.cardType === 'Gold'}
                onChange={(e) => handleChange('cardType', e.target.value)}
              /> Gold
            </label>
            <label className={`flex items-center gap-2 ${isPreFilled('cardType', 'Classic') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="cardType" 
                value="Classic"
                checked={creditCard.cardType === 'Classic'}
                onChange={(e) => handleChange('cardType', e.target.value)}
              /> Classic
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Card Category</label>
          <div className="flex flex-col gap-2">
            <label className={`flex items-center gap-2 ${isPreFilled('cardCategory', 'Standard Credit Card') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="cardCategory" 
                value="Standard Credit Card"
                checked={creditCard.cardCategory === 'Standard Credit Card'}
                onChange={(e) => handleChange('cardCategory', e.target.value)}
              /> Standard Credit Card
            </label>
            <label className={`flex items-center gap-2 ${isPreFilled('cardCategory', 'Non-Photo') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="cardCategory" 
                value="Non-Photo"
                checked={creditCard.cardCategory === 'Non-Photo'}
                onChange={(e) => handleChange('cardCategory', e.target.value)}
              /> Non-Photo
            </label>
            <label className={`flex items-center gap-2 ${isPreFilled('cardCategory', 'Photo') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="cardCategory" 
                value="Photo"
                checked={creditCard.cardCategory === 'Photo'}
                onChange={(e) => handleChange('cardCategory', e.target.value)}
              /> Photo
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Special Card Option</label>
          <div className="flex flex-col gap-2">
            <label className={`flex items-center gap-2 ${isPreFilled('specialCardOption', 'UBL PSO Auto Credit Card') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="specialCardOption" 
                value="UBL PSO Auto Credit Card"
                checked={creditCard.specialCardOption === 'UBL PSO Auto Credit Card'}
                onChange={(e) => handleChange('specialCardOption', e.target.value)}
              /> UBL PSO Auto Credit Card
            </label>
            <label className={`flex items-center gap-2 ${isPreFilled('specialCardOption', 'Galleria Card') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="specialCardOption" 
                value="Galleria Card"
                checked={creditCard.specialCardOption === 'Galleria Card'}
                onChange={(e) => handleChange('specialCardOption', e.target.value)}
              /> Galleria Card
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Photo Submission Method (Galleria Only)</label>
          <div className="flex flex-col gap-2">
            <label className={`flex items-center gap-2 ${isPreFilled('photoSubmissionMethod', 'Website Upload') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="photoMethod" 
                value="Website Upload"
                checked={creditCard.photoSubmissionMethod === 'Website Upload'}
                onChange={(e) => handleChange('photoSubmissionMethod', e.target.value)}
              /> Website Upload
            </label>
            <label className={`flex items-center gap-2 ${isPreFilled('photoSubmissionMethod', 'Favorite Picture') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="photoMethod" 
                value="Favorite Picture"
                checked={creditCard.photoSubmissionMethod === 'Favorite Picture'}
                onChange={(e) => handleChange('photoSubmissionMethod', e.target.value)}
              /> Favorite Picture
            </label>
            <label className={`flex items-center gap-2 ${isPreFilled('photoSubmissionMethod', 'Physically Attach') ? 'bg-green-50 p-1 rounded' : ''}`}>
              <input 
                type="radio" 
                name="photoMethod" 
                value="Physically Attach"
                checked={creditCard.photoSubmissionMethod === 'Physically Attach'}
                onChange={(e) => handleChange('photoSubmissionMethod', e.target.value)}
              /> Physically Attach
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Markup</label>
          <div className="py-2 text-base font-semibold">3.3325% (display only)</div>
        </div>
      </div>
    </section>
  );
};
