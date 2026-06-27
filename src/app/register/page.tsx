"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'personal' | 'address' | 'school' | 'review'>(
    'personal'
  );
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    // Personal
    nisn: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',

    // Address
    address: '',
    city: '',
    province: '',
    zipcode: '',
    latitude: '',
    longitude: '',

    // School
    preferredSchool: '',
    pathway: '',
    gpa: '',

    // Parent
    parentName: '',
    parentPhone: '',
  });

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCurrentStep = (): boolean => {
    if (step === 'personal') {
      if (!formData.nisn || formData.nisn.length !== 16) {
        addToast('error', 'NISN harus 16 digit');
        return false;
      }
      if (!formData.fullName.trim()) {
        addToast('error', 'Nama lengkap harus diisi');
        return false;
      }
      if (!formData.dateOfBirth) {
        addToast('error', 'Tanggal lahir harus diisi');
        return false;
      }
      if (!formData.gender) {
        addToast('error', 'Jenis kelamin harus dipilih');
        return false;
      }
      if (!formData.email.includes('@')) {
        addToast('error', 'Email tidak valid');
        return false;
      }
      if (!formData.phone) {
        addToast('error', 'No. telepon harus diisi');
        return false;
      }
      if (!formData.gpa || parseFloat(formData.gpa) > 4 || parseFloat(formData.gpa) < 0) {
        addToast('error', 'IPK harus antara 0-4');
        return false;
      }
    } else if (step === 'address') {
      if (!formData.address.trim()) {
        addToast('error', 'Alamat harus diisi');
        return false;
      }
      if (!formData.city.trim()) {
        addToast('error', 'Kota harus diisi');
        return false;
      }
      if (!formData.province.trim()) {
        addToast('error', 'Provinsi harus diisi');
        return false;
      }
      if (!formData.zipcode) {
        addToast('error', 'Kode pos harus diisi');
        return false;
      }
    } else if (step === 'school') {
      if (!formData.preferredSchool) {
        addToast('error', 'Sekolah tujuan harus dipilih');
        return false;
      }
      if (!formData.pathway) {
        addToast('error', 'Jalur pendaftaran harus dipilih');
        return false;
      }
      if (!formData.parentName.trim()) {
        addToast('error', 'Nama orang tua harus diisi');
        return false;
      }
      if (!formData.parentPhone) {
        addToast('error', 'No. telepon orang tua harus diisi');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step === 'personal') setStep('address');
      else if (step === 'address') setStep('school');
      else if (step === 'school') setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'address') setStep('personal');
    else if (step === 'school') setStep('address');
    else if (step === 'review') setStep('school');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nisn: formData.nisn,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          gpa: formData.gpa,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zipcode: formData.zipcode,
          latitude: formData.latitude,
          longitude: formData.longitude,
          preferredSchool: formData.preferredSchool,
          pathway: formData.pathway,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          certificatePoints: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast('error', data.error || 'Gagal membuat pendaftaran');
        setLoading(false);
        return;
      }

      addToast('success', 'Pendaftaran berhasil dibuat!');
      
      // Redirect to results page or dashboard after 2 seconds
      setTimeout(() => {
        router.push('/results');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      addToast('error', 'Terjadi kesalahan saat membuat pendaftaran');
      setLoading(false);
    }
  };

  const progressPercentage = {
    personal: 25,
    address: 50,
    school: 75,
    review: 100,
  }[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg animate-fade-in ${
              toast.type === 'success'
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? '✓ ' : '✗ '} {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white rounded-lg p-3 mb-4">
            <span className="text-2xl font-bold">PP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pendaftaran PPDB
          </h1>
          <p className="text-gray-600">Langkah {['personal', 'address', 'school', 'review'].indexOf(step) + 1} dari 4</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progressPercentage}% Selesai</p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Personal Information */}
            {step === 'personal' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Informasi Pribadi</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      NISN *
                    </label>
                    <Input
                      type="text"
                      name="nisn"
                      placeholder="16 digit NISN"
                      value={formData.nisn}
                      onChange={handleInputChange}
                      maxLength={16}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nama Lengkap *
                    </label>
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Nama lengkap"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tanggal Lahir *
                    </label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Jenis Kelamin *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih</option>
                      <option value="M">Laki-laki</option>
                      <option value="F">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      IPK *
                    </label>
                    <Input
                      type="number"
                      name="gpa"
                      placeholder="3.50"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      No. Telepon *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="08123456789"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Address Information */}
            {step === 'address' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Alamat Tempat Tinggal</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Alamat Lengkap *
                  </label>
                  <Input
                    as="textarea"
                    name="address"
                    placeholder="Jalan, no rumah, RT/RW"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kota *
                    </label>
                    <Input
                      type="text"
                      name="city"
                      placeholder="Jakarta"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Provinsi *
                    </label>
                    <Input
                      type="text"
                      name="province"
                      placeholder="DKI Jakarta"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kode Pos *
                    </label>
                    <Input
                      type="text"
                      name="zipcode"
                      placeholder="12345"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-4">
                    📍 Arahkan lokasi rumah dengan peta
                  </p>
                  {/* Map will be integrated here */}
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Peta akan ditampilkan di sini</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: School Selection */}
            {step === 'school' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Pilihan Sekolah</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sekolah Tujuan *
                  </label>
                  <Input
                    as="select"
                    name="preferredSchool"
                    value={formData.preferredSchool}
                    onChange={handleInputChange}
                    required
                    options={[
                      { value: '', label: '-- Pilih Sekolah --' },
                      { value: '1', label: 'SMA Negeri 1 Jakarta' },
                      { value: '2', label: 'SMA Negeri 2 Bandung' },
                      { value: '3', label: 'SMA Negeri 3 Surabaya' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Jalur Pendaftaran *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'prestasi', label: 'Jalur Prestasi (GPA ≥ 3.0)' },
                      { value: 'zonasi', label: 'Jalur Zonasi (Radius 5 km)' },
                      { value: 'afirmasi', label: 'Jalur Afirmasi' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                        <input
                          type="radio"
                          name="pathway"
                          value={option.value}
                          checked={formData.pathway === option.value}
                          onChange={handleInputChange}
                          required
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Orang Tua/Wali *
                  </label>
                  <Input
                    type="text"
                    name="parentName"
                    placeholder="Nama lengkap"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    No. Telepon Orang Tua/Wali *
                  </label>
                  <Input
                    type="tel"
                    name="parentPhone"
                    placeholder="08123456789"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Verifikasi Data</h2>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">NISN</p>
                      <p className="font-semibold text-gray-900">{formData.nisn}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Nama</p>
                      <p className="font-semibold text-gray-900">{formData.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">IPK</p>
                      <p className="font-semibold text-gray-900">{formData.gpa}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Jalur</p>
                      <p className="font-semibold text-gray-900 capitalize">{formData.pathway}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    ⚠️ Pastikan semua data sudah benar sebelum mengirim. Data tidak bisa diubah setelah submit.
                  </p>
                </div>

                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    id="agree"
                    required
                    className="rounded"
                  />
                  <label htmlFor="agree" className="text-sm text-gray-700">
                    Saya telah membaca dan setuju dengan syarat & ketentuan pendaftaran
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              {step !== 'personal' && (
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  ← Kembali
                </Button>
              )}
              {step !== 'review' ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  Lanjut →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin">⟳</span>
                      Mengirim...
                    </>
                  ) : (
                    <>✓ Kirim Pendaftaran</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
