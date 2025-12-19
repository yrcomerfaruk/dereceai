'use client';

import React from 'react';

// Örnek ödeme verileri
const payments = [
  { id: 1, date: '2024-10-15', amount: '₺250.00', description: 'Aylık Koçluk Paketi' },
  { id: 2, date: '2024-09-15', amount: '₺250.00', description: 'Aylık Koçluk Paketi' },
  { id: 3, date: '2024-08-15', amount: '₺250.00', description: 'Aylık Koçluk Paketi' },
  { id: 4, date: '2024-07-15', amount: '₺250.00', description: 'Aylık Koçluk Paketi' },
];

const paymentInfo = {
  cardNumber: '**** **** **** 4242',
  expiryDate: '12/26',
  cardType: 'Visa',
  memberSince: '2024-07-15',
};

export default function PaymentsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Ödeme Bilgileri Kartı */}
      <div className="border border-gray-300 rounded-lg p-3 mb-3 bg-white">
        <h2 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">Ödeme Yöntemi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 mb-1">Kredi Kartı</h3>
            <p className="text-gray-900 text-xs">{paymentInfo.cardType} - {paymentInfo.cardNumber}</p>
            <p className="text-xs text-gray-500 mt-0.5">Son Kullanma: {paymentInfo.expiryDate}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 mb-1">Üyelik Başlangıcı</h3>
            <p className="text-gray-900 text-xs">{paymentInfo.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Ödeme Geçmişi */}
      <h2 className="text-sm font-bold text-gray-900 mb-2">Ödeme Geçmişi</h2>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tarih
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Açıklama
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-xs text-gray-900">
                    {payment.date}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900">
                    {payment.description}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900 text-right font-semibold">
                    {payment.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
