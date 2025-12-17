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
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ödemeler</h1>

      {/* Ödeme Bilgileri Kartı */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ödeme Yöntemi ve Üyelik</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-600">Kredi Kartı</h3>
            <p className="text-gray-800">{paymentInfo.cardType} - {paymentInfo.cardNumber}</p>
            <p className="text-sm text-gray-500">Son Kullanma Tarihi: {paymentInfo.expiryDate}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Üyelik Başlangıcı</h3>
            <p className="text-gray-800">{paymentInfo.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Ödeme Geçmişi */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Ödeme Geçmişi</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Açıklama
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tutar
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{payment.date}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{payment.description}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">
                  <p className="text-gray-900 whitespace-no-wrap">{payment.amount}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
