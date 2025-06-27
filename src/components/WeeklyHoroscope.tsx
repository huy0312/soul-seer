import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, BookOpen } from 'lucide-react';
import { useState } from 'react';

const zodiacSigns = [
  {
    name: "Bạch Dương",
    period: "21/3 - 19/4",
    color: "from-red-500 to-pink-500",
    weeklyMessage: `♈ BẠCH DƯƠNG

🌙 Đây là một tuần Bạch Dương sẽ đầu tư khá là nhiều thời gian để làm những thứ mà mình yêu thích. Tụi nó sẽ sắp hết thời gian cho những niềm đam mê và yêu thích của mình. Thậm chí cuộc đời có thể cũng tạo cơ hội cho tụi nó được làm những điều này.

🌙 Năng lượng của Bạch Dương tuần này khá là siêng năng bởi vì cảm xúc của tụi nó sẽ khá tốt, cho nên tràn trề sức lực để phấn đấu và cố gắng.

🌙 Dấu hiệu này ngoài ra có thể cho thấy, Bạch Dương có thể nảy sinh tình cảm với một ai đó hoặc là cố gắng theo đuổi tình cảm với người mà mình thích một cách nồng nàn mãnh liệt.

🌙 Có thể thấy ở lá bài thứ 3, năng lượng không hề nhẹ nhàng cho lắm. Nên trái ngược với những điều ở trên thì tuần này, Bạch Dương sẽ có thể chịu đựng một vài những nguồn năng lượng căng thẳng, không dễ dàng vượt qua hay chống chọi. Những điều này đặc biệt có thể xảy ra vào tầm giai đoạn cuối tuần.`
  },
  {
    name: "Kim Ngưu",
    period: "20/4 - 20/5",
    color: "from-green-500 to-emerald-500",
    weeklyMessage: `♉ KIM NGƯU

🌙 Tuần này năng lượng cung khí đến với Kim Ngưu khá là nhiều. Chúng tớ đây là một tuần tụi nó sẽ phải giao tiếp và trò chuyện cũng như sử dụng năng lực này để giải quyết khá nhiều vấn đề trong cuộc sống. Thế nên hãy nhớ, có những chuyện hãy biết sử dụng khả năng khôn khéo, giao thiệp của mình.

🌙 Kim Ngưu có thể sẽ được một ai đó chủ động liên kết về một tài chính với tụi nó, hoặc sẽ có thêm một cơ hội để gia tăng khả năng phát triển tài chính. Nhưng ngược lại đây cũng có thể là một khoản chi mới xuất hiện trong cuộc đời của Kim Ngưu.

🌙 Tuần này Kim Ngưu có thể có cơ hội được hợp tác làm việc, được một ai đó đồng hành trong con đường công việc của mình. Hoặc đấy cũng có thể là một đối tác làm ăn mới vừa xuất hiện.

🌙 Tuần này năng lượng của Kim Ngưu khá là tràn đầy và năng nổ, dù có sự kiện hay điều gì xảy ra cũng cho thấy tụi nó với rất vui tươi, tích cực để đón nhận điều đó. Sẽ là một tuần có nhiều niềm vui và tiếng cười.

🌙 Gia đình của Kim Ngưu có thể thông báo cho tụi nó một tin tức gì đó khá tích cực, vui vẻ.`
  },
  {
    name: "Song Tử",
    period: "21/5 - 20/6",
    color: "from-blue-500 to-cyan-500",
    weeklyMessage: `♊ SONG TỬ

🌙 Song Tử có thể hoàn thành nhanh chóng những hoạt động của bản thân hoặc là những dự định tụi nó đã ấp ủ từ lâu trong tuần này.

🌙 Một tin tức hoặc là sự thật Song Tử đang mong ngóng từ ai đó có thể đến với tụi nó. Đây là một câu trả lời thật lòng nhân đôi lúc nó có thể gây ra cảm giác buồn bã trong một vài trường hợp.

🌙 Song Tử có thể biết được sự thật về một ai đó thông qua một câu chuyện xuất hiện trước mắt tụi nó. Điều này có thể là một điều không được vui vẻ cho lắm.

🌙 Ngoài ra đây cũng là một tuần của những cuộc trò chuyện chóng vánh nhưng nếu rõ ràng quan điểm giữa Song Tử và các mối quan hệ.`
  },
  {
    name: "Cự Giải",
    period: "21/6 - 22/7",
    color: "from-purple-500 to-violet-500",
    weeklyMessage: `♋ CỰ GIẢI

🌙 Một năng lượng toàn là gậy, chứng tỏ đây là tuần Cự Giải phải hoạt động khá là nhiều. Thế nên tụi nó có thể sẽ phải chuẩn bị thể lực, sức khỏe để đối diện với những hoạt động tuần tới.

🌙 Tuần này cũng là một tuần lẽ mà Cự Giải sẽ phải ôm đồm khá là nhiều thứ. Nhiều gánh nặng tụi nó sẽ phải gánh vác trên vai, không hề dễ chịu cho lắm, có thể dẫn đến sự quá tải.

🌙 Ngoài ra Cự Giải có thể sẽ phải đối diện với những hành trình hoặc là trách nhiệm mới đặc biệt là những vị trí có tính chất quan trọng. Thông qua tuần này một vài Cự Giải thật sự sẽ lột xác và gia tăng sức bền của mình lên rất nhiều.

🌙 Cự Giải sẽ đóng vai trò là người chỉ đạo hoặc là dẫn dắt hay là tư vấn cho người khác, thậm chí là sẽ cần phải bắt tay vào làm để hướng dẫn cho người khác nếu như người ta cần.`
  },
  {
    name: "Sư Tử",
    period: "23/7 - 22/8",
    color: "from-amber-500 to-orange-500",
    weeklyMessage: `🦁 SƯ TỬ

🌙 Năng lượng này cho thấy tuần này Sư Tử rất dễ bị người khác giận dỗi. Hoặc người khác có thể bỏ mặc tụi nó trước các vấn đề xuất hiện, khiến cho tụi nó cảm thấy cô đơn và lạc lõng.

🌙 Sư Tử sẽ phải quan tâm đến suy nghĩ của người khác rất là nhiều, tụi nó sẽ phải dò đoán ý nghĩ của người khác.

🌙 Đây cũng là một tuần lẽ Sư Tử sẽ phải tham khảo khá là nhiều ý kiến, hợp tác hoặc là nhờ vả sự giúp đỡ của một ai đó khi bản thân quá thiếu đi tài nguyên hoặc là kiến thức để làm một hoạt động nào đó.

🌙 Tuần này năng lượng của Sư Tử khá là dịu dàng, dù có chuyện gì xảy ra thì dẫu nhiên tuần này tụi nó cũng trở nên ấm áp, tình cảm. Sự thấu hiểu và bao dung cho người khác được nâng cao lên khá nhiều trong tuần này.`
  },
  {
    name: "Xử Nữ",
    period: "23/8 - 22/9",
    color: "from-teal-500 to-cyan-500",
    weeklyMessage: `🌾 XỬ NỮ

🌙 Xử Nữ có dấu hiệu là sẽ được một ai đó theo đuổi trong tuần này. Nhưng dấu hiệu cho thấy đối phương không phải là một người làm cho Xử Nữ cảm thấy yên tâm ở giai đoạn ban đầu. Tuy nhiên họ lại có khá khá những điểm tốt và đáng để xem xét nên bọn nó cũng khá hoang mang.

🌙 Có rất nhiều năng lượng cho thấy Xử Nữ có thể có người yêu hoặc là đạt được một mức độ gắn kết mới trong các mối quan hệ tình cảm của mình. Đây sẽ là tuần lễ những mối quan hệ tình cảm trở nên rất vững chắc và có nền tảng tốt hơn.

🌙 Ngoài ra đây cũng là một tuần lễ Xử Nữ sẽ tìm được một ai đó có danh tiếng hoặc làm hình tượng tốt để kết nối, phát triển cùng với họ.

🌙 Xử Nữ sẽ nhận được một vài sự chú ý, khen ngợi hoặc công nhận từ cấp trên và những người đang quan sát tụi nó. Thông qua tuần lễ này Xử Nữ có thể phát triển được giá trị của mình khá là nhiều trong mắt những người thân quen. Tuy nhiên tụi nó cũng không hoàn toàn thoải mái với điều này, còn rất nhiều nỗi lo âu bên trong.`
  },
  {
    name: "Thiên Bình",
    period: "23/9 - 22/10",
    color: "from-pink-500 to-rose-500",
    weeklyMessage: `♎ THIÊN BÌNH

🌙 Cụm từ phù hợp nhất dành cho Thiên Bình tuần này là: khổ trước sướng sau. Tụi nó sẽ có khá là nhiều áp lực hoặc là mệt mỏi để phải chịu đựng. Nhưng sau những sự khổ sở chịu đựng đó, sẽ là niềm hạnh phúc hoặc là những giá trị tương xứng mà tụi nó đáng được hưởng. Vì vậy hãy cứ cố gắng và nỗ lực hết mình trong tuần này nhé!

🌙 Thiên Bình có thể sẽ nhận được tình yêu thương ấm áp từ gia đình hoặc là các mối quan hệ thân quen. Nếu như tụi nó đang có một vài áp lực phải chịu đựng thì họ có thể chính là nơi sưởi ấm trái tim của Thiên Bình, giúp bạn tìm lại sự bình yên và động lực.

🌙 Thiên Bình có thể được ai đó giúp đỡ hoặc tụi nó sẽ đi nhờ và sự giúp đỡ của người khác. Họ có thể trao cho tụi nó những tài nguyên đặc biệt là liên quan đến tài chính, mang lại những cơ hội bất ngờ.`
  },
  {
    name: "Bọ Cạp",
    period: "23/10 - 21/11",
    color: "from-red-600 to-red-500",
    weeklyMessage: `♏ BỌ CẠP

🌙 Tuần này Bọ Cạp cũng sẽ trở nên khá là năng động và tràn đầy nhiệt huyết. Sự dũng cảm và tinh thần mạo hiểm của Bọ Cạp được dâng lên khá nhiều, thôi thúc bạn bước ra khỏi vùng an toàn. Điều này giúp cho tụi nó dám đương đầu khám phá thế giới và cuộc sống xung quanh của mình. Một vài Bọ Cạp sẽ bắt đầu bước vào hành trình lằn xả, phiêu lưu, tìm kiếm những điều mới mẻ.

🌙 Bọ Cạp vẫn biết giữ vững một vài giá trị trong cuộc sống của mình. Dù năng lượng của tụi nó có phần khá là thích khám phá và đổi mới trong tuần này nhưng vẫn biết giữ lại những giá trị ổn định, chắc chắn cho cuộc sống của mình. Điều này tạo nên sự cân bằng hài hòa giữa đổi mới và ổn định.

🌙 Bọ Cạp cũng sẽ có một tuần rất năng động về tài chính, đặc biệt nếu như tụi nó đang gặp khó khăn về mặt này. Một vài cơ hội tài chính sẽ mở ra hoặc là một con đường tài chính sẽ xuất hiện, mang lại những giải pháp bất ngờ và tiềm năng phát triển.`
  },
  {
    name: "Nhân Mã",
    period: "22/11 - 21/12",
    color: "from-purple-600 to-purple-500",
    weeklyMessage: `♐ NHÂN MÃ

🌙 Năng lượng The Magician không phải là một năng lượng quá tốt đối với cung Nhân Mã. Bởi vì Nhân Mã thường thiên về hành động và trải nghiệm nhiều hơn là lý trí. Lên đây có thể là tuần Nhân Mã sẽ cải thiện những điểm yếu hoặc là những thứ mình chưa thử sức. Một vài Nhân Mã sẽ phải học cách tự mình tìm hiểu các kiến thức mà tụi nó không có hứng thú lắm, nhưng kiến thức đó lại rất cần thiết cho các hoạt động của mình.

🌙 Tuần này sẽ có rất rất nhiều chủ đề và câu chuyện đa dạng đến với cuộc đời của Nhân Mã. Vì thế tụi nó sẽ có một tuần lễ bận rộn và tràn đầy màu sắc, liên tục có những điều mới mẻ xảy ra.

🌙 Có ai đó sẽ đến giúp đỡ và cho Nhân Mã cảm giác khá là thiện lành, tụi nó sẽ có thể được chăm sóc và được vỗ về. Đặc biệt nếu như Nhân Mã nào gặp vấn đề về sức khỏe thì có thể được người thân yêu đến chăm sóc một cách chu đáo.`
  },
  {
    name: "Ma Kết",
    period: "22/12 - 19/1",
    color: "from-slate-600 to-slate-500",
    weeklyMessage: `♑ MA KẾT

🌙 Ma Kết tuần này sẽ có một chút năng lượng sáng tạo, đổi mới hoặc là đi theo những hướng mới trong cuộc sống của mình. Điều này giúp Ma Kết có thêm những góc nhìn mới mẻ và tìm kiếm các giải pháp đột phá.

🌙 Một vài Ma Kết có thể không chỉ là sáng tạo mà còn là sự lột xác, dám thể hiện và tỏa sáng bản thân, làm những thứ có sự đột phá với một năng lượng cực kỳ vui tươi và phấn khích. Bạn sẽ cảm thấy tràn đầy hứng khởi để thử thách bản thân.

🌙 Tuần này có khá nhiều trải nghiệm khiến Ma Kết cảm thấy rất đam mê, yêu thích. Đây là một tuần Ma Kết có thể phát triển về mặt tinh thần, cảm thấy yêu đời hơn và có nhu cầu muốn đổi mới cuộc sống hơn. Sự đổi mới này sẽ mang lại năng lượng tích cực cho bạn.

🌙 Đối tượng tình cảm của Ma Kết có thể chủ động liên kết sâu sắc và để cho tụi nó thấu hiểu về họ nhiều hơn. Đây là cơ hội để mối quan hệ trở nên gắn kết và ý nghĩa hơn.`
  },
  {
    name: "Bảo Bình",
    period: "20/1 - 18/2",
    color: "from-blue-600 to-blue-500",
    weeklyMessage: `♒ BẢO BÌNH

🌙 Tuần này Bảo Bình có thể cũng được đón nhận những năng lượng khá là hạnh phúc và tràn đầy lý tưởng sống. Niềm vui hạnh phúc này đặc biệt có thể đến từ những con người mà tụi nó gắn kết rất sâu, họ đem đến một sự truyền tải cảm xúc, chạm sâu vào trái tim của Bảo Bình, mang lại sự bình yên và mãn nguyện.

🌙 Những niềm vui sẽ đến với cuộc sống của Bảo Bình trong tuần này nhưng tụi nó có cảm giác, những điều này chỉ là tạm thời và không tồn tại mãi mãi. Vì thế tụi nó sẽ có xu hướng nỗ lực và cống hiến nhiều hơn để tạo ra hạnh phúc tự thân, chủ động tìm kiếm sự bình yên và niềm vui cho bản thân.

🌙 Những thứ sắp xảy đến giống như động lực để cho tụi nó tin tưởng vào cuộc sống của chính mình, mở ra những triển vọng mới.

🌙 Chính Bảo Bình cũng sẽ bước ra khỏi vùng an toàn của bản thân tuần này để nỗ lực và cố gắng làm những thứ khá là khác biệt với cuộc sống của mình. Bởi vì tụi nó nhận ra có những thứ mình đang không ổn và tương lai lại nếu cứ duy trì như thế thì sẽ không tốt, cần phải thay đổi mà thôi.`
  },
  {
    name: "Song Ngư",
    period: "19/2 - 20/3",
    color: "from-cyan-500 to-blue-500",
    weeklyMessage: `♓ SONG NGƯ

🌙 Song Ngư có thể trở thành chính mình, một con người tràn đầy mơ mộng, lý tưởng sống, về đúng năng lượng của bản thân - The Fool. Tụi nó có thể bắt tay vào thực tế hóa những mơ mộng và lý tưởng này của mình nhờ vào nguồn năng lượng đầy tích cực này. Bạn sẽ cảm thấy tự do và sáng tạo hơn bao giờ hết.

🌙 Song Ngư có thể tìm được những người bạn đồng hành có cùng chung chí hướng hoặc là khá giống với cách sống của Song Ngư. Những người bạn của tụi nó nên ủng hộ, hỗ trợ Song Ngư phát triển những điều mà bọn nó đang muốn làm, tạo nên một mạng lưới hỗ trợ vững chắc.

🌙 Song Ngư sẽ có một vài sự thăng tiến đối với cuộc sống của mình, phát triển thêm những giá trị mới, đạt được những kết quả ban đầu. Một vài Song Ngư thậm chí sẽ có thêm thu nhập đối với những cố gắng mà bản thân đang làm, mang lại sự ổn định và phát triển về tài chính.`
  }
];

const WeeklyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState<number | null>(null);

  return (
    <section id="horoscope" className="py-20 bg-gradient-to-b from-slate-900 to-purple-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              Thông Điệp Tuần 12 Cung
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans">
            Khám phá vận mệnh hàng tuần cho từng cung hoàng đạo qua lá bài Tarot
          </p>
          <div className="flex items-center justify-center mt-4 text-slate-400">
            <Calendar className="w-5 h-5 mr-2" />
            <span className="font-sans">Cập nhật mỗi tuần</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {zodiacSigns.map((sign, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm group cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => setSelectedSign(selectedSign === index ? null : index)}
            >
              <CardHeader className="text-center pb-3">
                <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${sign.color} rounded-full flex items-center justify-center mb-3 group-hover:animate-pulse`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-white mb-1 font-serif">
                  {sign.name}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs font-sans">
                  {sign.period}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pt-0">
                <Button className={`w-full bg-gradient-to-r ${sign.color} hover:opacity-90 text-white font-semibold py-2 rounded-full transition-all duration-300 text-sm font-sans`}>
                  {selectedSign === index ? 'Ẩn Thông Điệp' : 'Xem Thông Điệp'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Message Display */}
        {selectedSign !== null && (
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-900/80 to-slate-900/80 border-purple-400/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${zodiacSigns[selectedSign].color} rounded-full flex items-center justify-center mb-4`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2 font-serif">
                  Thông Điệp Tuần Này - {zodiacSigns[selectedSign].name}
                </CardTitle>
                <CardDescription className="text-purple-200 font-sans">
                  {zodiacSigns[selectedSign].period}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-purple-100 leading-relaxed font-sans mb-6">
                  {zodiacSigns[selectedSign].weeklyMessage}
                </p>
                <div className="flex items-center justify-center text-purple-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm font-sans">Cập nhật: Tuần {Math.ceil(new Date().getDate() / 7)} tháng {new Date().getMonth() + 1}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-full text-lg animate-glow font-sans"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Xem Tất Cả Blog Horoscope
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WeeklyHoroscope;