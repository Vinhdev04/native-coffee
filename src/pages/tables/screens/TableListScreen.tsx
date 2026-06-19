import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform, RefreshControl, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, QrCode, RefreshCw, X, ShoppingBag, Eye } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, FONTS } from '@/styles/theme';
import { fetchTables } from '@/services/orderService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import s from "../styles/TableListScreen.styles.ts"

const { width } = Dimensions.get('window');

const TableListScreen = () => {
  const navigation = useNavigation<any>();
  const { setActiveTable } = useCart();
  const { user } = useAuth();
  
  const branchId = user?.branchId || (user as any)?.branch_id || 1;
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'EMPTY' | 'OCCUPIED'>('ALL');

  // Modal State
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showingQR, setShowingQR] = useState(false);

  const filteredTables = useMemo(() => {
    if (filter === 'ALL') return tables;
    return tables.filter(t => {
      const isOcc = ['ORDERED', 'OCCUPIED', 'IN_USE'].includes(String(t.status).toUpperCase());
      return filter === 'OCCUPIED' ? isOcc : !isOcc;
    });
  }, [tables, filter]);

  const loadTables = async () => {
    try {
      const res = await fetchTables(branchId);
      const data = (res as any)?.data?.rows || (res as any)?.data || (res as any)?.rows || res || [];
      setTables(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bàn:', err);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách bàn' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTables();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTables();
  };

  const handlePressTable = (table: any) => {
    setSelectedTable(table);
    setModalVisible(true);
  };

  const handleStartOrder = () => {
    if (!selectedTable) return;
    setActiveTable({
      id: selectedTable.id,
      name: selectedTable.name,
      qrToken: selectedTable.qrToken || String(selectedTable.id)
    });
    setModalVisible(false);
    Toast.show({
      type: 'success',
      text1: `Đã chọn ${selectedTable.name}`,
    });
    navigation.navigate('Main', { screen: 'MenuTab' });
  };

  const handleShowQR = () => {
    setShowingQR(true);
  };

  const renderItem = ({ item }: { item: any }) => {
    // Trạng thái bàn dựa theo data
    // status có thể là "ORDERED", "OCCUPIED", "IN_USE" = Đang dùng
    const isOccupied = ['ORDERED', 'OCCUPIED', 'IN_USE'].includes(String(item.status).toUpperCase());
    
    return (
      <TouchableOpacity 
        style={[s.card, isOccupied ? s.cardOccupied : s.cardEmpty]} 
        onPress={() => handlePressTable(item)}
        activeOpacity={0.8}
      >
        <View style={s.cardHeader}>
          <View style={[s.statusBadge, isOccupied ? s.badgeOccupied : s.badgeEmpty]}>
            <View style={[s.statusDot, { backgroundColor: isOccupied ? '#F97316' : '#10B981' }]} />
            <Text style={[s.statusText, { color: isOccupied ? '#F97316' : '#10B981' }]}>
              {isOccupied ? 'Đang dùng' : 'Trống'}
            </Text>
          </View>
        </View>
        <Text style={s.tableName}>{item.name}</Text>
        
        <View style={s.cardFooter}>
          <View style={s.footerBtn}>
            <Text style={s.footerBtnText}>Trống</Text>
          </View>
          <View style={[s.footerBtn, s.footerBtnRight]}>
            <Text style={s.footerBtnText}>Dùng</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const totalOccupied = tables.filter(t => ['ORDERED', 'OCCUPIED', 'IN_USE'].includes(String(t.status).toUpperCase())).length;
  const totalEmpty = tables.length - totalOccupied;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={s.headerTitleContainer}>
             <Text style={s.headerTitle}>Quản lý bàn</Text>
             <Text style={s.headerSubtitle}>{tables.length} bàn · {totalEmpty} trống · {totalOccupied} đang dùng</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          <TouchableOpacity style={s.actionBtn} onPress={onRefresh}>
             <RefreshCw size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[s.actionBtn, { marginLeft: 10 }]} 
            onPress={() => navigation.navigate('ScanQR', { scanType: 'table' })}
          >
            <QrCode size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs / Filters */}
      <View style={s.filtersContainer}>
        <TouchableOpacity 
          style={[s.filterBtn, filter === 'ALL' && s.filterBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[s.filterText, filter === 'ALL' && s.filterTextActive]}>Tất cả ({tables.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.filterBtn, filter === 'EMPTY' && s.filterBtnActive]}
          onPress={() => setFilter('EMPTY')}
        >
          <Text style={[s.filterText, filter === 'EMPTY' && s.filterTextActive]}>Trống ({totalEmpty})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.filterBtn, filter === 'OCCUPIED' && s.filterBtnActive]}
          onPress={() => setFilter('OCCUPIED')}
        >
          <Text style={[s.filterText, filter === 'OCCUPIED' && s.filterTextActive]}>Đang dùng ({totalOccupied})</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredTables.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>Chưa có dữ liệu bàn</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTables}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={s.listContent}
          columnWrapperStyle={s.row}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* Modal Tùy chọn Bàn / QR */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setModalVisible(false); setShowingQR(false); }}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{selectedTable?.name}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setShowingQR(false); }}>
                <X size={24} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            
            {showingQR && selectedTable ? (
              <View style={s.qrContainer}>
                <View style={s.qrWrapper}>
                  <QRCode
                    value={`https://bill-dev.chips.com.vn/qr?token=${selectedTable.qrToken || selectedTable.id}`}
                    size={200}
                    color="#0F172A"
                    backgroundColor="#FFFFFF"
                  />
                </View>
                <Text style={s.qrHint}>Khách hàng quét mã này để tự gọi món</Text>
                
                <TouchableOpacity style={s.modalBtnSecondary} onPress={() => setShowingQR(false)}>
                  <Text style={s.modalBtnTextSecondary}>Quay lại thao tác</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={s.modalSubtitle}>Chọn thao tác trên bàn này:</Text>
                
                <TouchableOpacity style={s.modalBtnPrimary} onPress={handleStartOrder}>
                  <ShoppingBag size={20} color="#FFF" style={s.modalBtnIcon} />
                  <Text style={s.modalBtnTextPrimary}>Bắt đầu gọi món</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.modalBtnSecondary} onPress={handleShowQR}>
                  <QrCode size={20} color={COLORS.primary} style={s.modalBtnIcon} />
                  <Text style={s.modalBtnTextSecondary}>Hiển thị mã QR của bàn</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export default TableListScreen;
